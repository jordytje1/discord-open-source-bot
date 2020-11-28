const Discord = require("discord.js")
const db = require("quick.db")
const fs = require('fs')
const yaml = require("js-yaml");
const backup = require("discord-backup")
const { attention, permission, messagesfetchlimts, yes, arrowhere, botlog, no } = yaml.load(fs.readFileSync("./config.yml"));

module.exports = {
    config: {
        name: "backup-remove",
        description: "Remove Backup.",
        accessableby: "Administrator",
        category: "backup",
        aliases: [],
        usage: ''
    },
    run: async (client, message, args) => {

        let backupID = args[0];
        if(!backupID){
            let notvaild = new Discord.MessageEmbed()
            .setAuthor(client.user.username, client.user.displayAvatarURL)
            .setDescription(`${arrowhere} You must specify a valid backup ID To Remove ${no}`)
            .setFooter(message.author.username, message.author.displayAvatarURL())
                
            return message.channel.send(notvaild);
        }
        backup.fetch(backupID).then((backupInfos) => {
            backup.remove(backupID)
             let backups = new Discord.MessageEmbed()
           .setAuthor(message.author.username, message.author.displayAvatarURL())
           .setDescription(`** BACKUP DELETE**`)
           .setFooter(client.user.username, client.user.displayAvatarURL())
           client.channels.cache.get(botlog).send(`** NEW BACKUP DELETED**\n Author: ${message.author.username}`)
   message.channel.send(backups)
}).catch((err) => {
    let nobackupfound = new Discord.MessageEmbed()
    .setAuthor(client.user.username, client.user.displayAvatarURL)
    .setDescription(`No Backup Found For ${backupID} ${attention}`)
    .setFooter(message.author.username, message.author.displayAvatarURL())
    return message.channel.send(nobackupfound);
});
    }
}