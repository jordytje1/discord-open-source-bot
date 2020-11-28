const ms = require("parse-ms")
const db = require('quick.db')
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { PREFIX } = require('../../config');

module.exports = {
    config: {
        name: "vouch",
        aliases: [''],
        category: 'info',
        description: 'Vouching a user',
        usage: '[mention]',
        accessableby: 'everyone'
    },
    run: async (bot, message, args) => {
        let timeout = 43200000;
        	let prefix;
            let fetched = await db.fetch(`prefix_${message.guild.id}`)
            if (fetched === null) {
                prefix = PREFIX
            } else {
                prefix = fetched
            }
        let bump = await db.fetch(`cooldown_${message.author.id}`)
        if (bump !== null && timeout - (Date.now() - bump) > 0) {
            let time = ms(timeout - (Date.now() - bump));
            return message.channel.send(new Discord.MessageEmbed().setAuthor(message.author.username , message.author.displayAvatarURL()).setDescription(`**You're On Cooldown**\nTime Left: ${time.hours}H , ${time.minutes}M , ${time.seconds}S`).setFooter(message.guild.name , message.guild.iconURL()))        }
        let user = message.mentions.users.first()
        if(!user) {return message.channel.send(new Discord.MessageEmbed().setAuthor(message.author.username , message.author.displayAvatarURL()).setDescription(`**${prefix}vouch @user**`).setFooter(message.guild.name , message.guild.iconURL()))}
       if(user.id === message.author.id) return message.channel.send(new Discord.MessageEmbed().setAuthor(message.author.username , message.author.displayAvatarURL()).setDescription(`:clown: you cant vouch yourself!`).setFooter(message.guild.name , message.guild.iconURL()))

        db.add(`userthanks_${user.id}`, 1)
        db.set(`cooldown_${message.author.id}`, Date.now())
        return message.channel.send(new Discord.MessageEmbed().setAuthor(message.author.username , message.author.displayAvatarURL()).setDescription(`You Have Vouched ${user}`).setFooter(message.guild.name , message.guild.iconURL()))
    }
};
