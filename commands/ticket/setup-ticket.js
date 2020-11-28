const Discord = require('discord.js');
const db = require('quick.db');
const rs = require('randomstring');
module.exports = {
    config: {
        name: 'setup-ticket',
        category: 'ticket',
        aliases: [''],
        description: 'Setup ticket system',
        accessableby: 'everyone',
        usage: ' '
    },
    run: async (bot, message, args) => {
    let ticketroom = message.mentions.channels.first();
      let embed = new Discord.MessageEmbed() .setDescription(`Please Mention an vaild channel`)
      if(!ticketroom) return message.channel.send(embed);
      let sent = await ticketroom.send(new Discord.MessageEmbed()
      .setTitle("Ticket System")
      .setDescription("React With :tickets: To Open Ticket!")
      .setFooter(message.guild.name)
  );    
    sent.react('🎟️');
    db.delete(`tickets_${message.guild.id}`)
    db.set(`tickets_${message.guild.id}`, sent.id)
    message.channel.send("Great Job Human! Ticket-System are ready to be used!")
    }
}