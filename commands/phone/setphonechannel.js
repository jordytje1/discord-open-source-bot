const db = require("quick.db")

module.exports = {
    config: {
        name: "setphonechannel",
        category: "phone",
        aliases: ['setp', 'spc', 'setpc'],
        description: "Sets A Channel For Phone Calls",
        usage: "[channel mention | channel ID | channel name]",
        accessableby: "Administrators"
    },
    run: async (bot, message, args) => {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("**You Do Not Have The Required Permissions! - [ADMINISTRATOR]**")
        if (!args[0]) {
            let b = await db.fetch(`pc_${message.guild.id}`);
            let channelName = message.guild.channels.cache.get(b);
            if (message.guild.channels.cache.has(b)) {
                return message.channel.send(`**Phone Call Channel Set In This Server Is \`${channelName.name}\`!**`);
            } else
                return message.channel.send("**Please Enter A Channel Name or ID To Set!**");
        }
        let channel = message.mentions.channels.first() || bot.guilds.cache.get(message.guild.id).channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name.toLowerCase() === args.join(' ').toLocaleLowerCase());

        if (!channel) return message.channel.send("**Please Enter A Valid Channel Name or ID!**")

        try {
            let a = await db.fetch(`pc_${message.guild.id}`)

            if (channel.id === a) {
                return message.channel.send("**This Channel is Already Set As Phone Call Channel!**")
            } else {
                bot.guilds.cache.get(message.guild.id).channels.cache.get(channel.id).send("**Phone Call Channel Set!**")
                db.set(`pc_${message.guild.id}`, channel.id)
                db.push('pclist', { ChannelID: channel.id });

                return message.channel.send(`**Phone Call Channel Has Been Set Successfully in \`${channel.name}\`!**`)
            }
        } catch {
            return message.channel.send("**Error - `Missing Permissions or Channel Doesn't Exist!`**")
        }
    }
};