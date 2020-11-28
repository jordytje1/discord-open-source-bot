const { MessageEmbed } = require('discord.js')

module.exports = {
    config: {
        name: "uptime",
        description: "Shows Uptime of bot",
        aliases: ["up"],
        category: "info",
        usage: " ",
        accessableby: "everyone"
    },
    run: async(bot, message, args) => {
        let days = Math.floor(bot.uptime / 86400000);
        let hours = Math.floor(bot.uptime / 3600000) % 24;
        let minutes = Math.floor(bot.uptime / 60000) % 60;
        let seconds = Math.floor(bot.uptime / 1000) % 60;

        const embed = new MessageEmbed()
            .setTitle("Uptime")
            .setColor("GREEN")
            .setDescription(`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`)
            .setThumbnail(bot.user.displayAvatarURL())
            .setFooter(message.guild.name, message.guild.iconURL())
            .setAuthor(bot.user.username, bot.user.displayAvatarURL())  
        message.channel.send(embed);
    }
}