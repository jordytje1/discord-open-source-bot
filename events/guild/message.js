const db = require('quick.db');
const { PREFIX } = require('../../config.js');
const queue2 = new Map();
const queue3 = new Map();
const queue = new Map();
const games = new Map()

module.exports = async (bot, message) => {
    try {
        if (message.author.bot || message.channel.type === "dm") 
          return;

        let prefix;
        let fetched = await db.fetch(`prefix_${message.guild.id}`);

        if (fetched === null) {
            prefix = PREFIX
        } else {
            prefix = fetched
        }

        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let cmd = args.shift().toLowerCase();

        if (!message.content.startsWith(prefix)) return;

        let ops = {
            queue: queue,
            queue2: queue2,
            queue3: queue3,
            games: games
        }

        var commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd))
        if (commandfile) commandfile.run(bot, message, args, ops);
    } catch (error) {
        console.log(error);
    }
}