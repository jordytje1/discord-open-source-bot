const Discord = require("discord.js")
const db = require("quick.db")
const fs = require('fs')
const yaml = require("js-yaml");
const backup = require("discord-backup")
const { attention, permission, messagesfetchlimts, yes, arrowhere, botlog, no, load } = yaml.load(fs.readFileSync("./config.yml"));

module.exports = {
    config: {
        name: "backup-create",
        description: "Create Backup For Your Guild",
        accessableby: "Administrator",
        category: "backup",
        aliases: [],
        usage: ''
    },
    run: async (client, message, args) => {

		if(!message.member.hasPermission("ADMINISTRATOR", "MANAGE_GUILD")){
          let permissionsembed = new Discord.MessageEmbed()
            .setTitle(`${attention} **Missing Permissions**`)
            .setDescription(`${permission} You Must Have [ADMINISTRATOR, MANAGE_GUILD] Perms To Use This Command!`)
            .setFooter(message.guild.name, client.user.displayAvatarURL())
             message.channel.send(permissionsembed)
             return;
        }
        message.channel.send(`${load} Creating Backup... `)
        backup.create(message.guild, {
            jsonBeautify: true,
            saveImages: "base64",
            maxMessagesPerChannel: messagesfetchlimts,
        }).then((backupData) => {
            let guildicon = message.guild.iconURL()
            let datacreated = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setDescription(`${yes} New Backup Created\n ${arrowhere} **Backup ID**: ${backupData.id}\n ${arrowhere} **Guild Name**: ${message.guild.name} `)
            .setFooter(message.guild.name, guildicon)
             message.author.send(datacreated);
             let created = new Discord.MessageEmbed()
             .setAuthor(message.author.username, message.author.displayAvatarURL())
             .setDescription(`${yes} Backup Has Been Created `)
             .setFooter(message.guild.name, guildicon)
              client.channels.cache.get(botlog).send(`** NEW BACKUP CREATED **\nBackup ID: ${backupData.id} \nBackup Author: ${message.author.username} \nGuild: ${message.guild.name}`)
    
            message.channel.send(created);
        });
    }
}