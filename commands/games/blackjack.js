const { stripIndents } = require('common-tags');
const { shuffle, verify } = require('../../functions');
const db = require('quick.db');
const suits = ['♣', '♥', '♦', '♠'];
const faces = ['Jack', 'Queen', 'King'];
const hitWords = ['hit', 'hit me'];
const standWords = ['stand'];

module.exports = {
    config: {
        name: 'blackjack',
        aliases: ['bj'],
        category: 'games',
        usage: '[deck] <bet>',
        description: 'Play A Game Of Blackjack!',
        accessableby: 'everyone'
    },
    run: async (bot, message, args, ops) => {
        if (!args[0]) return message.channel.send('**Please Enter Your Deck Amount!**')
        let deckCount = parseInt(args[0])
        if (isNaN(args[0])) return message.channel.send('**Please Enter A Number!**')
        if (deckCount <= 0 || deckCount >= 9) return message.channel.send("**Please Enter A Number Between 1 - 8!**")

        let user = message.author;
        let bal = db.fetch(`money_${user.id}`)
        if (!bal === null) bal = 0;
        if (!args[1]) return message.channel.send("**Please Enter Your Bet!**")

        let amount = parseInt(args[1])
        if (isNaN(args[1])) return message.channel.send("**Please Enter A Number**")
        if (amount > 10000) return message.channel.send("**Cannot Place Bet More Than \`10000\`**")

        if (bal < amount) return message.channel.send("**You Are Betting More Than You Have!**")
        const current = ops.games.get(message.channel.id);
        if (current) return message.channel.send(`**Please Wait Until The Current Game Of \`${current.name}\` Is Finished!**`);
        try {
            ops.games.set(message.channel.id, { name: 'blackjack', data: generateDeck(deckCount) });
            const dealerHand = [];
            draw(message.channel, dealerHand);
            draw(message.channel, dealerHand);
            const playerHand = [];
            draw(message.channel, playerHand);
            draw(message.channel, playerHand);
            const dealerInitialTotal = calculate(dealerHand);
            const playerInitialTotal = calculate(playerHand);

            if (dealerInitialTotal === 21 && playerInitialTotal === 21) {
                ops.games.delete(message.channel.id);
                return message.channel.send('**Both Of You Just Hit Blackjack!**');
            } else if (dealerInitialTotal === 21) {
                ops.games.delete(message.channel.id);
                db.subtract(`money_${user.id}`, amount);
                return message.channel.send(`**The Dealer Hit Blackjack Right Away!\nNew Balance - **\` ${bal - amount}\``);
            } else if (playerInitialTotal === 21) {
                ops.games.delete(message.channel.id);
                db.add(`money_${user.id}`, amount)
                return message.channel.send(`**You Hit Blackjack Right Away!\nNew Balance -**\`${bal + amount}\``);
            }

            let playerTurn = true;
            let win = false;
            let reason;
            while (!win) {
                if (playerTurn) {
                    await message.channel.send(stripIndents`
						**First Dealer Card -** ${dealerHand[0].display}
						**You [${calculate(playerHand)}] -**
						**${playerHand.map(card => card.display).join('\n')}**
                        \`[Hit / Stand]\`
					`);
                    const hit = await verify(message.channel, message.author, { extraYes: hitWords, extraNo: standWords });
                    if (hit) {
                        const card = draw(message.channel, playerHand);
                        const total = calculate(playerHand);
                        if (total > 21) {
                            reason = `You Drew ${card.display}, Total Of ${total}! Bust`;
                            break;
                        } else if (total === 21) {
                            reason = `You Drew ${card.display} And Hit 21!`;
                            win = true;
                        }
                    } else {
                        const dealerTotal = calculate(dealerHand);
                        await message.channel.send(`**Second Dealer Card Is ${dealerHand[1].display}, Total Of ${dealerTotal}!**`);
                        playerTurn = false;
                    }
                } else {
                    const inital = calculate(dealerHand);
                    let card;
                    if (inital < 17) card = draw(message.channel, dealerHand);
                    const total = calculate(dealerHand);
                    if (total > 21) {
                        reason = `Dealer Drew ${card.display}, Total Of ${total}! Dealer Bust`;
                        win = true;
                    } else if (total >= 17) {
                        const playerTotal = calculate(playerHand);
                        if (total === playerTotal) {
                            reason = `${card ? `Dealer Drew ${card.display}, Making It ` : ''}${playerTotal}-${total}`;
                            break;
                        } else if (total > playerTotal) {
                            reason = `${card ? `Dealer Drew ${card.display}, Making It ` : ''}${playerTotal}-\`${total}\``;
                            break;
                        } else {
                            reason = `${card ? `Dealer Drew ${card.display}, Making It ` : ''}\`${playerTotal}\`-${total}`;
                            win = true;
                        }
                    } else {
                        await message.channel.send(`**Dealer Drew ${card.display}, Total Of ${total}!**`);
                    }
                }
            }
            db.add(`games_${user.id}`, 1)
            ops.games.delete(message.channel.id);
            if (win) {
                db.add(`money_${user.id}`, amount);
                return message.channel.send(`**${reason}, You Won ${amount}!**`);
            } else {
                db.subtract(`money_${user.id}`, amount);
                return message.channel.send(`**${reason}, You Lost ${amount}!**`);
            }
        } catch (err) {
            ops.games.delete(message.channel.id);
            throw err;
        }

        function generateDeck(deckCount) {
            const deck = [];
            for (let i = 0; i < deckCount; i++) {
                for (const suit of suits) {
                    deck.push({
                        value: 11,
                        display: `${suit} Ace!`
                    });
                    for (let j = 2; j <= 10; j++) {
                        deck.push({
                            value: j,
                            display: `${suit} ${j}`
                        });
                    }
                    for (const face of faces) {
                        deck.push({
                            value: 10,
                            display: `${suit} ${face}`
                        });
                    }
                }
            }
            return shuffle(deck);
        }

        function draw(channel, hand) {
            const deck = ops.games.get(channel.id).data;
            const card = deck[0];
            deck.shift();
            hand.push(card);
            return card;
        }

        function calculate(hand) {
            return hand.sort((a, b) => a.value - b.value).reduce((a, b) => {
                let { value } = b;
                if (value === 11 && a + value > 21) value = 1;
                return a + value;
            }, 0);
        }
    }
};