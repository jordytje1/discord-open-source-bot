const { Collection } = require('discord.js');
const { Hand } = require('pokersolver');
const { stripIndents } = require('common-tags');
const Deck = require('../../structures/poker/Deck');
const { formatNumber, list, delay } = require('../../functions');
const max = 6;
const min = 2;
const bigBlindAmount = 100;
const smallBlindAmount = 50;
const raiseRegex = /raise (\$?([0-9]+)?,?[0-9]+)/i;

module.exports = {
    config: {
        name: 'poker',
        aliases: ['texasholdem'],
        category: 'games',
        usage: '[amount]',
        description: `Play Poker With Up To 1 - ${max - 1} Other Users`,
        accessableby: "everyone"
    },
    run: async (bot, message, args, ops) => {
        let playersCount = args[0];
        if (!playersCount) return message.channel.send("**Please Enter The Number Of Players Playing Excluding You!**")
        if (playersCount < 1 || playersCount >= 6) return message.channel.send("**Please Enter A Number Between 1-5!**")
        const current = ops.games.get(message.channel.id);
        if (current) return message.channel.send(`**Please Wait Until The Current Game Of \`${current.name}\` Is Finished!**`);
        ops.games.set(message.channel.id, {
            name: 'poker',
            data: {
                deck: new Deck(),
                players: new Collection(),
                turnData: {
                    pot: 0,
                    currentBet: 0,
                    highestBetter: null
                }
            }
        });
        try {
            const awaitedPlayers = await awaitPlayers(message, playersCount);
            if (awaitedPlayers.length - 1 < playersCount) {
                ops.games.delete(message.channel.id);
                return message.channel.send('**Sufficient Amount Of Players Didnt Join!**');
            }
            const { players, deck, turnData } = ops.games.get(message.channel.id).data;
            for (const player of awaitedPlayers) {
                players.set(player, {
                    money: 5000,
                    id: player,
                    hand: [],
                    user: bot.users.cache.get(player),
                    currentBet: 0,
                    hasGoneOnce: false,
                    strikes: 0
                });
            }
            let winner = null;
            const rotation = players.map(p => p.id);
            while (!winner) {
                const bigBlind = players.get(rotation[1]);
                bigBlind.money -= bigBlindAmount;
                bigBlind.currentBet += bigBlindAmount;
                const smallBlind = players.get(rotation[2] || rotation[0]);
                smallBlind.money -= smallBlindAmount;
                smallBlind.currentBet += smallBlindAmount;
                rotation.push(rotation[0]);
                rotation.shift();
                const folded = [];
                await message.channel.send('**Dealing Player Hands...**');
                for (const player of players.values()) {
                    player.hand.push(...deck.draw(2));
                    try {
                        await player.user.send(stripIndents`
							**Your Poker Hand -**
							${player.hand.map(c => c.textDisplay).join('\n')}
							**Money -** $${formatNumber(player.money)}
							${bigBlind.id === player.id ? '_You Are The Big Blind!_' : ''}
							${smallBlind.id === player.id ? '_You Are The Small Blind!_' : ''}
						`);
                    } catch (e) {
                        console.log(e);
                        await message.channel.send(`**${player.user}, I Couldn't Send Your Hand! Turn On DMs!**`);
                    }
                }
                turnData.pot = bigBlindAmount + smallBlindAmount;
                turnData.currentBet = bigBlindAmount;
                turnData.highestBetter = bigBlind;
                let keepGoing = await gameRound(message, players, folded, turnData, bigBlind, smallBlind);
                if (!keepGoing) continue;
                const dealerHand = deck.draw(3);
                await message.channel.send(stripIndents`
					**Dealer Hand -**
					${dealerHand.map(card => card.textDisplay).join('\n')}
					_Next Betting Round Begins In 5 Seconds!_
				`);
                await delay(5000);
                keepGoing = await gameRound(message, players, folded, turnData, bigBlind, smallBlind);
                if (!keepGoing) continue;
                dealerHand.push(deck.draw());
                await message.channel.send(stripIndents`
					**Dealer Hand -**
					${dealerHand.map(card => card.textDisplay).join('\n')}
					_Next Betting Round Begins In 5 Seconds!_
				`);
                await delay(5000);
                keepGoing = await gameRound(message, players, folded, turnData, bigBlind, smallBlind);
                if (!keepGoing) continue;
                dealerHand.push(deck.draw());
                await message.channel.send(stripIndents`
					**Dealer Hand -**
					${dealerHand.map(card => card.textDisplay).join('\n')}
					_Next Betting Round Begins In 5 Seconds!_
				`);
                await delay(5000);
                keepGoing = await gameRound(message, players, folded, turnData, bigBlind, smallBlind);
                if (!keepGoing) continue;
                const solved = [];
                for (const playerID of rotation) {
                    if (folded.includes(playerID)) continue;
                    const player = players.get(playerID);
                    const solvedHand = Hand.solve([
                        ...player.hand.map(card => card.pokersolverKey),
                        ...dealerHand.map(card => card.pokersolverKey)
                    ]);
                    solvedHand.user = player;
                    solved.push(solvedHand);
                }
                const winners = Hand.winners(solved);
                if (winners.length > 1) {
                    await message.channel.send(stripIndents`
						The Pot Will Be Split Between ${list(winners.map(w => `**${w.user.user}**`))}.
						${winners.map(winner.descr).join(', ')}
						__**Results**__
						${solved.map(solve => `${solve.user.user.tag}: ${solve.descr}`).join('\n')}
						_Next Game Starting In 10 seconds._
					`);
                    const splitPot = turnData.pot / winners.length;
                    for (const win of winners) win.user.money += splitPot;
                } else {
                    await message.channel.send(stripIndents`
						${winners[0].user.user} Takes The Pot, With **${winners[0].descr}**.
						__**Results**__
						${solved.map(solve => `${solve.user.user.tag}: ${solve.descr}`).join('\n')}
						_Next Game Starting In 10 Seconds!_
					`);
                    winners[0].user.money += turnData.pot;
                }
                await resetGame(message, players);
                if (players.size <= 1) {
                    winner = players.first();
                    break;
                }
                await delay(10000);
            }
            ops.games.delete(message.channel.id);
            return message.channel.send(`**Congrats, ${winner.user}!**`);
        } catch (err) {
            ops.games.delete(message.channel.id);
            throw err;
        }

        async function awaitPlayers(message, players) {
            await message.channel.send(`**Type \`join game\` To Join The Game!**`);
            const joined = [];
            joined.push(message.author.id);
            const filter = res => {
                if (res.author.bot) return false;
                if (joined.includes(res.author.id)) return false;
                if (res.content.toLocaleLowerCase() !== 'join game'.toLocaleLowerCase()) return false;
                joined.push(res.author.id);
                res.react('✅').catch(() => null);
                return true;
            };
            const verify = await message.channel.awaitMessages(filter, { max: players, time: 30000 });
            verify.set(message.id, message);
            if (verify.size < min - 1) return false;
            return verify.map(player => player.author.id);
        }

        function determineActions(turnPlayer, currentBet) {
            const actions = [];
            if (turnPlayer.currentBet !== currentBet) actions.push('fold');
            if (turnPlayer.money > currentBet) actions.push('raise <amount>');
            if (turnPlayer.money >= currentBet && turnPlayer.currentBet !== currentBet) actions.push('call');
            if (currentBet === turnPlayer.currentBet) actions.push('check');
            return actions;
        }

        function makeTurnRotation(players, folded, bigBlind, smallBlind) {
            return [
                smallBlind.id,
                ...players.filter(p => bigBlind.id !== p.id && smallBlind.id !== p.id).map(p => p.id),
                bigBlind.id
            ].filter(player => !folded.includes(player));
        }

        async function gameRound(message, players, folded, turnData, bigBlind, smallBlind) {
            let turnOver = false;
            const turnRotation = makeTurnRotation(players, folded, bigBlind, smallBlind);
            while (!turnOver) turnOver = await bettingRound(message, players, turnRotation, folded, turnData);
            resetHasGoneOnce(players);
            if (turnRotation.length === 1) {
                const remainer = players.get(turnRotation[0]);
                await message.channel.send(stripIndents`
				**${remainer.user} Takes The Pot!**
				_Next Game Starting In 10 Seconds!_
			`);
                await message.channel.send(`**${remainer.user} Takes The Pot!**`);
                remainer.money += turnData.pot;
                await resetGame(message, players);
                await delay(10000);
                return false;
            }
            return true;
        }

        async function bettingRound(message, players, turnRotation, folded, data) {
            const oldHighestBetter = data.highestBetter;
            const turnPlayer = players.get(turnRotation[0]);
            const actions = determineActions(turnPlayer, data.currentBet);
            const displayActions = list(actions.map(action => `\`${action}\``), 'or');
            await message.channel.send(stripIndents`
			**Pot - $${formatNumber(data.pot)}**
			_Highest Bet - $${formatNumber(data.currentBet)} (${data.highestBetter.user.tag})_
			${turnPlayer.user}, What Do You Want To Do? You Can ${displayActions}.
		`);
            const filter = res => {
                if (res.author.id !== turnPlayer.id) return false;
                let choice = res.content.toLowerCase();
                if (actions.includes(choice) && !choice.startsWith('raise')) return true;
                if (choice.startsWith('raise')) {
                    if (!raiseRegex.test(choice)) return false;
                    choice = choice.replace(/[$,]/g, '');
                    const amount = Number.parseInt(choice.match(raiseRegex)[1], 10);
                    if (amount + data.currentBet > turnPlayer.money || amount < 1) {
                        const maxBet = turnPlayer.money - data.currentBet;
                        res.channel.send(`**You Can Only Bet Up To $${formatNumber(maxBet)}!**`).catch(() => null);
                        return false;
                    }
                    return true;
                }
                return false;
            };
            const messages = await message.channel.awaitMessages(filter, { max: 1, time: 60000 });
            let choiceAction;
            if (messages.size) {
                choiceAction = messages.first().content.toLowerCase().replace(/[$,]/g, '');
            } else if (turnPlayer.currentBet !== data.currentBet) {
                choiceAction = 'fold';
                turnPlayer.strikes++;
            } else if (data.currentBet === turnPlayer.currentBet) {
                choiceAction = 'check';
                turnPlayer.strikes++;
            } else {
                choiceAction = 'fold';
                turnPlayer.strikes++;
            }
            const raiseValue = raiseRegex.test(choiceAction) ? Number.parseInt(choiceAction.match(raiseRegex)[1], 10) : null;
            if (raiseValue) {
                const amountChange = raiseValue + (data.currentBet - turnPlayer.currentBet);
                data.pot += amountChange;
                data.highestBetter = turnPlayer;
                turnPlayer.money -= amountChange;
                turnPlayer.currentBet += amountChange;
                data.currentBet += raiseValue;
                await message.channel.send(`**${turnPlayer.user} Raises $${formatNumber(raiseValue)}!**`);
            } else if (choiceAction.toLowerCase() === 'call'.toLocaleLowerCase()) {
                const amountChange = data.currentBet - turnPlayer.currentBet;
                turnPlayer.money -= amountChange;
                turnPlayer.currentBet += amountChange;
                data.pot += amountChange;
                await message.channel.send(`**${turnPlayer.user} Calls $${formatNumber(data.currentBet)}!**`);
            } else if (choiceAction.toLowerCase() === 'fold'.toLocaleLowerCase()) {
                folded.push(turnPlayer.id);
                await message.channel.send(`**${turnPlayer.user} folds!**`);
            } else if (choiceAction.toLowerCase() === 'check'.toLocaleLowerCase()) {
                await message.channel.send(`**${turnPlayer.user} Checks!**`);
            }
            if (choiceAction.toLowerCase() !== 'fold'.toLocaleLowerCase()) turnRotation.push(turnRotation[0]);
            turnRotation.shift();
            turnPlayer.hasGoneOnce = true;
            const nextPlayer = players.get(turnRotation[0]);
            return (oldHighestBetter.id === turnPlayer.id && choiceAction === 'check' && nextPlayer.hasGoneOnce)
                || (oldHighestBetter.currentBet === turnPlayer.currentBet
                    && turnRotation[0] === oldHighestBetter.id
                    && nextPlayer.hasGoneOnce)
                || turnRotation.length === 1;
        }

        async function resetGame(message, players) {
            for (const player of players.values()) {
                if (player.money <= 0) {
                    await message.channel.send(`**${player.user} Has Been Kicked For Having No Money!**`);
                    players.delete(player.id);
                } else if (player.strikes >= 2) {
                    await message.channel.send(`**${player.user} Has Been Kicked For Not Playing!**`);
                    players.delete(player.id);
                } else {
                    player.currentBet = 0;
                    player.hand = [];
                    player.hasGoneOnce = false;
                }
            }
            return players;
        }

        function resetHasGoneOnce(players) {
            for (const player of players.values()) player.hasGoneOnce = false;
            return players;
        }
    }
};
