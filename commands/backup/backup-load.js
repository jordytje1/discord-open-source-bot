const Discord = require("discord.js")
const db = require("quick.db")
const fs = require('fs')
const yaml = require("js-yaml");
const backup = require("discord-backup")
const { PREFIX } = require('../../config');
const { attention, permission, messagesfetchlimts, yes, arrowhere, botlog } = yaml.load(fs.readFileSync("./config.yml"));

module.exports = {
    config: {
        name: "backup-load",
        description: "Load Your Guild Backup",
        accessableby: "Administrator",
        category: "backup",
        aliases: [],
        usage: ''
    },
    run: async (client, message, args) => {
 
      
      const guildicon2 = message.guild.iconURL()

      if(!message.member.hasPermission("ADMINISTRATOR", "MANAGE_GUILD")){
        let permissionsembed = new Discord.MessageEmbed()
        .setTitle(`${attention} **Missing Permissions**`)
        .setDescription(`${permission} You Must Have [ADMINISTRATOR, MANAGE_GUILD] Perms To Use This Command!`)
        .setFooter(message.guild.name, client.user.displayAvatarURL())
         message.channel.send(permissionsembed)
         return;
    }
    let backupID = args[0];
    if(!backupID){
       let Speficyid = new Discord.MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setDescription(`${attention} You Must Speficy a Vaild Backup ID!`)
      .setFooter(message.guild.name, guildicon2)

        return message.channel.send(Speficyid);
    }
    // Fetching the backup to know if it exists
    backup.fetch(backupID).then(async () => {

	let prefix;
        let fetched = await db.fetch(`prefix_${message.guild.id}`);

        if (fetched === null) {
            prefix = PREFIX
        } else {
            prefix = fetched
        }

      let warning = new Discord.MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setDescription(`:warning: | When the backup is loaded, all the channels, roles, etc. will be replaced! Type **${prefix}confirm** to confirm!!`)
      .setFooter(message.guild.name, guildicon2)

         message.channel.send(warning);
            await message.channel.awaitMessages(m => (m.author.id === message.author.id) && (m.content === prefix + "confirm"), {
                max: 1,
                time: 20000,
                errors: ["time"]
            }).catch((err) => {
              let guildicon2 = message.guild.iconURL()
              let timeisup = new Discord.MessageEmbed()
              .setAuthor(message.author.username, message.author.displayAvatarURL())
              .setDescription(`${attention} Time's up! Cancelled backup loading!`)
              .setFooter(message.guild.name, guildicon2)

                 return message.channel.send(timeisup);
            });
             let loadingstarting = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setDescription(`${yes} Start loading the backup!`)
            .setFooter(message.guild.name, guildicon2)

             message.channel.send(loadingstarting);
             client.channels.cache.get(botlog).send(`** LOADING NEW BACKUP **\nBackup ID: ||Private||\nBackup Author: ${message.author.username}\nBackup Size: ${backupID.size}\nGuild: ${message.guild.name}`)
               
             backup.load(backupID, message.guild).then(() => {
                 //backup.remove(backupID);
            }).catch((err) => {
               let permissionserorr = new Discord.MessageEmbed()
              .setAuthor(message.author.username, message.author.displayAvatarURL())
              .setDescription(`${attention}  Sorry, an error occurred... Please check that I have administrator permissions!`)
              .setFooter(message.guild.name, guildicon2)
              client.channels.cache.get(botlog)(botlog).send(`** BACKUP FAILED TO LOAD **\nBackup ID: ${backupID} \nBackup Author: ${message.author.username}\nBackup Size: ${backupID.size}\nGuild: ${message.guild.name}`)

                 return message.author.send(permissionserorr);
            });
    }).catch((err) => {
        console.log(err);
         let nobackupfound = new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setDescription(`${attention} No backup found for ${backupID}!`)
        .setFooter(message.guild.name, guildicon2)

         return message.channel.send(nobackupfound);
    });

    }
}