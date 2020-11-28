const { MessageEmbed } = require("discord.js")

module.exports = {
    config: {
        name: "lock",
        aliases: [""],
        description: "Lock Channels",
        category: "moderation",
        usage: "",
        accessableby: "Administrator",
    },
    run: async (bot, message, args) => {
          if(!message.member.hasPermission("MANAGE_CHANNELS"))
    return message.channel.send(
        new MessageEmbed()
        .setDescription("You don't have enough permissions to use this command.")
    )
    if(!message.mentions.channels.first()) return message.channel.send(
        new MessageEmbed()
        .setDescription("You didn't specify a channel to lock.")
    )

   await message.mentions.channels.forEach(async channel => {

        if(channel.permissionsFor(message.guild.id).has("SEND_MESSAGES") === false) return message.channel.send("That channel is already locked.");
        try {
         await channel.updateOverwrite(message.guild.id, {
            SEND_MESSAGES: false
        });
        message.channel.send(`<#${channel.id}> has been successfully locked.`)
        } catch(err) {
            console.log(err);
        }
      }
    )
  }
};