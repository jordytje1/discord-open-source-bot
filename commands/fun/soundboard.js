const path = require('path');
const { list } = require('../../functions');
const sounds = require('../../JSON/soundboard.json');

module.exports = {
    config: {
        name: 'soundboard',
        aliases: ['sound'],
        category: 'fun',
        usage: `${list(sounds, 'or')}`,
        description: 'Plays A Sound in A Voice Channel',
        accessableby: 'everyone'
    },
    run: async (bot, message, args) => {
        if (!message.guild.me.hasPermission(['CONNECT', 'SPEAK'])) return message.channel.send("**I Dont Have Permissions To Either - JOIN or SPEAK!**");
        const { channel } = message.member.voice;
        if (!channel) return message.channel.send("**Please Join A VC To Play Sound!**");

        if (!args[0]) {
            let soundlist = `${sounds[Math.floor(Math.random() * sounds.length)]}.mp3`;
            let sound = `${soundlist.toLowerCase()}`;

            try {
                const connection = message.guild ? await channel.join() : null;
                if (connection) {
                    connection.play(path.join(__dirname, '..', '..', 'assets', 'sounds', sound));
                    if (message.channel.permissionsFor(bot.user).has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) {
                        await message.react('🔉');
                    } else {
                        connection.dispatcher.end();
                        channel.leave();
                        return message.channel.send("**Missing Permission - [ADD_REACTIONS]!**");
                    }
                } else {
                    return message.channel.send("**Could Not Join VC, Try Again!**");
                }
            } catch {
                return message.channel.send("**Something Went Wrong Try Again!**");
            }
            return null;
        } else {
            if (!sounds.includes(args[0])) return message.channel.send(`**Which Sound Do You Want To Play? Either ${list(sounds, 'or')}!**`);
            let sound = `${args[0].toLowerCase()}.mp3`;

            try {
                const connection = message.guild ? await channel.join() : null;
                if (connection) {
                    try {
                        connection.play(path.join(__dirname, '..', '..', 'assets', 'sounds', sound));
                        if (message.channel.permissionsFor(bot.user).has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) {
                            await message.react('🔉');
                        } else {
                            connection.dispatcher.end();
                            channel.leave();
                            return message.channel.send("**Missing Permission - [ADD_REACTIONS]!**");
                        }
                    } catch {
                        return message.channel.send("**Something Went Wrong Try Again!**");
                    };
                };
            } catch {
                return message.channel.send("**Couldn't Join VC, Check My Permissions!**");
            };
        };
    }
};