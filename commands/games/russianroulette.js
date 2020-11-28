const { stripIndents } = require('common-tags');
const { shuffle, verify } = require('../../functions');
const db = require('quick.db')

module.exports = {
	config: {
		name: 'russianroulette',
		aliases: ['rroul', 'russianroul', 'rgun'],
		category: 'games',
		usage: '[username | nickname | mention | ID]',
		description: 'Who Will Pull The Trigger And Die First? You Can Play Against Bots Too!',
		accessableby: 'everyone'
	},
	run: async (bot, message, args, ops) => {
		if (!args[0]) return message.channel.send('**Please Enter A User!**')
		let opponent = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === args.join(' ').toLocaleLowerCase()) || message.guild.members.cache.find(r => r.displayName.toLowerCase() === args.join(' ').toLocaleLowerCase());
		if (!opponent) return message.channel.send("**Please Enter A Valid User!**")
		if (opponent.user.id === message.author.id) return message.channel.send('**Cannot Play Against Yourself!**');
		const current = ops.games.get(message.channel.id);
		if (current) return message.channel.send(`**Please Wait Until The Current Game Of \`${current.name}\` Is Finished!**`);
		ops.games.set(message.channel.id, { name: 'russian-roulette' });
		try {
			if (!opponent.user.bot) {
				await message.channel.send(`**${opponent}, Do You Accept This Challenge?**`);
				const verification = await verify(message.channel, opponent);
				if (!verification) {
					ops.games.delete(message.channel.id);
					return message.channel.send(`**Looks Like ${opponent} Doesnt Wants To Play!**`);
				}
			}
			let userTurn = true;
			const gun = shuffle([true, false, false, false, false, false, false, false]);
			let round = 0;
			let winner = null;
			let quit = false;
			while (!winner) {
				const player = userTurn ? message.author : opponent
				const notPlayer = userTurn ? opponent : message.author;
				if (gun[round]) {
					message.channel.send(`**${player} Pulls The Trigger!**`).then(
						setTimeout(async function () {
							message.channel.send("**And Dies!**");
							await message.channel.send(`**The Winner Is ${winner}!**`);
						}, 4000)
					);
					winner = notPlayer;

				} else {
					await message.channel.send(`**${player} Pulls The Trigger!**`).then(
						setTimeout(function () {
							message.channel.send(stripIndents`
							**And lives...**
							${opponent.user.bot ? '**Continue?' : `**Will You Take The Gun, ${notPlayer}?`}** \`(${8 - round - 1} Shots Left!\`)
						`)
						}, 4000)
					);

					const keepGoing = await verify(message.channel, opponent.user.bot ? message.author : notPlayer);
					if (!keepGoing) {
						if (opponent.user.bot) winner = opponent;
						else winner = player;
						quit = true;
					}
					round++;
					userTurn = !userTurn;
				}
			}
      db.add(`games_${opponent.id}`, 1)
      db.add(`games_${message.author.id}`, 1)
			ops.games.delete(message.channel.id);
			if (quit) return message.channel.send(`**${winner} Wins, Because Their Opponent Was A Coward!**`);
		} catch (err) {
			ops.games.delete(message.channel.id);
			throw err;
		}
	}
};