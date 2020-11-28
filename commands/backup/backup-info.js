const Discord = require("discord.js")
const db = require("quick.db")
const fs = require('fs')
const yaml = require("js-yaml");
const backup = require("discord-backup")
const { attention, permission, messagesfetchlimts, yes, arrowhere, botlog, no } = yaml.load(fs.readFileSync("./config.yml"));

module.exports = {
    config: {
        name: "backup-info",
        description: "Show You List Of Your Guilds Backups",
        accessableby: "Administrator",
        category: "backup",
        aliases: [],
        usage: ''
    },
    run: async (client, message, args) =>     {  
      let backupID = args[0];
		 // backupIDl = args[0]
        if(!backupID){
            let notvaild = new Discord.MessageEmbed()
            .setAuthor(client.user.username, client.user.displayAvatarURL)
            .setDescription(`${arrowhere} You must specify a valid backup ID ${no}`)
            .setFooter(message.author.username, message.author.displayAvatarURL())
                
            return message.channel.send(notvaild);
        }
        backup.fetch(backupID).then((backupInfos) => {
            const date = new Date(backupInfos.data.createdTimestamp);
            const yyyy = date.getFullYear().toString(), mm = (date.getMonth()+1).toString(), dd = date.getDate().toString();
            const formatedDate = `${yyyy}/${(mm[1]?mm:"0"+mm[0])}/${(dd[1]?dd:"0"+dd[0])}`;
            let backups = new Discord.MessageEmbed()
           .setAuthor(message.author.username, message.author.displayAvatarURL())
           .setDescription(`** BACKUP INFO **\n ${arrowhere} Backup ID: ${backupInfos.id} \n ${arrowhere} Server ID: ${backupInfos.data.guildID} \n ${arrowhere} Backup Size: ${backupInfos.size} mb \n ${arrowhere} Backup Created At: ${formatedDate}`)
           .setFooter(`${attention} Vilon`, client.user.displayAvatarURL())
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