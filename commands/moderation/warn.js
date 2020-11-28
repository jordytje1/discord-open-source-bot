const { MessageEmbed } = require("discord.js");
const { redlight } = require('../../JSON/colours.json')
const db = require('quick.db');

module.exports = {
    config: {
        name: "warn",
        aliases: ['report'],
        category: "moderation",
        description: "reports a user of the guild",
        usage: "[name | nickname | mention | ID] <reason> (optional)",
        accessableby: "Administrator",
    },
    run: async (bot, message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("**You Dont Have The Permissions To Report Someone! - [MANAGE_GUILD]**");
        if (!args[0]) return message.channel.send("**Please Enter A User!**")

        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === args[0].toLocaleLowerCase()) || message.guild.members.cache.find(ro => ro.displayName.toLowerCase() === args[0].toLocaleLowerCase());
        if (!target) return message.channel.send("**Please Enter A User!**")
        if (target.id === message.member.id) return message.channel.send("**Cannot Warn Yourself!**")
        
        let reason = args.slice(1).join(" ")

        if (target.roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) return message.channel.send('**Cannot Warn This User!**')
        if (target.hasPermission("MANAGE_GUILD") || target.user.bot) return message.channel.send("**Cannot Warn This User!**")
      try {
        const sembed2 = new MessageEmbed()
            .setColor("RED")
            .setDescription(`**Hello, You Have Been Warned In ${message.guild.name} for - ${reason || "No Reason!"}**`)
            .setFooter(message.guild.name, message.guild.iconURL())
        target.send(sembed2)
      } catch {
        
      }
        if (reason) {
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`${message.guild.name}`, message.guild.iconURL())
            .setDescription(`**${target.displayName} Has Been Warned for ${reason}!**`)
        message.channel.send(embed)
        } else {
            const embed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`${message.guild.name}`, message.guild.iconURL())
            .setDescription(`**${target.displayName} Has Been Warned!**`)
        message.channel.send(embed)
        }

        let channel = db.fetch(`modlog_${message.guild.id}`)
        if (!channel) return;

        const sembed = new MessageEmbed()
            .setColor(redlight)
            .setTimestamp()
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .setFooter(message.guild.name, message.guild.iconURL())
            .setAuthor(`${message.guild.name} Modlogs`, message.guild.iconURL())
            .addField("**Moderation**", "report")
            .addField("**User Reported**", `${target}`)
            .addField("**User ID**", `${target.user.id}`)
            .addField("**Reported By**", `${message.member}`)
            .addField("**Reported in**", `${message.channel}`)
            .addField("**Reason**", `**${reason || "No Reason"}**`)
            .addField("**Date**", message.createdAt.toLocaleString());

            var sChannel = message.guild.channels.cache.get(channel)
            if (!sChannel) return;
            sChannel.send(sembed)
    }
}
