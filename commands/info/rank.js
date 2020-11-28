const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    config: {
        name: "rank",
        aliases: ['rank'],
        category: 'info',
        description: 'Shows User Profile',
        usage: '[mention | username | nickname | ID]',
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
	
 	let embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setAuthor(message.author.tag,message.author.avatarURL())
    .setDescription(`LeveL: ${db.fetch(`level_${message.guild.id}_${message.author.id}`) || "0"}\nXP: ${db.fetch(`messages_${message.guild.id}_${message.author.id}`) || "0"}`)

    message.channel.send(embed)
    }
}