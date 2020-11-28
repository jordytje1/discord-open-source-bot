const { MessageEmbed } = require('discord.js');

module.exports = {
    config: {
        name: "unban",
        aliases: ['ub'],
        category: "moderation",
        description: "un ban members",
        usage: "[ !unban [user id] ]",
   },
    run: async (client, message, args) => {
if (!message.member.hasPermission('BAN_MEMBERS')) {
            return message.channel.send(`You are unable to ban members`)
        }
        const member = args[0];

        if (!member) {
             return message.channel.send(`Error do : !help unban`)
        }

        try {
            message.guild.fetchBans().then(bans => {
                message.guild.members.unban(member)
            })
            await message.channel.send(`${member} has been unbanned!`)
        } catch (e) {
            return message.channel.send(`An error occured!`)
        }

    }
}