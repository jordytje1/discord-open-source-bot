const db = require("quick.db");

module.exports = {
  config: {
    name: "setwelcomechannel",
    category: "moderation",
    aliases: ["enablewelcomechannel", "swc", "ewc", 'sw', 'ew'],
    description: "Sets A Channel Where The Bot Can Welcome Users!",
    usage: "[channel mention | channel ID | channel name]",
    accessableby: "Administrators"
  },
  run: async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return message.channel.send(
        "**You Do Not Have The Required Permissions! - [ADMINISTRATOR]**"
      );
    
    if (!args[0]) {
      let b = await db.fetch(`welcome_${message.guild.id}`);
      let channelName = message.guild.channels.cache.get(b);
      if (message.guild.channels.cache.has(b)) {
        return message.channel.send(
          `**Welcome Channel Set In This Server Is \`${channelName.name}\` Channel!**`
        );
      } else return message.channel.send("**Please Enter Channel Name or ID To Set!**");
    }

    let channel =
      message.mentions.channels.first() ||
      bot.guilds.cache.get(message.guild.id).channels.cache.get(args[0]) ||
      message.guild.channels.cache.find(
        c => c.name.toLowerCase() === args.join(" ").toLocaleLowerCase()
      );
    
    if (!channel || channel.type !== 'text') return message.channel.send("**Please Enter A Valid Text Channel!**");

    try {
      let a = await db.fetch(`welcome_${message.guild.id}`);

      if (a === channel.id) {
        return message.channel.send(
          "**This Channel is Already Set As Welcome Channel**"
        );
      } else {
        bot.guilds.cache
          .get(message.guild.id)
          .channels.cache.get(channel.id)
          .send("**Welcome Channel Set!**");
        db.set(`welcome_${message.guild.id}`, channel.id);

        message.channel.send(
          `**Welcome Channel Has Been Set Successfully in \`${channel.name}\`**`
        );
      }
      return;
    } catch (e) {
            return message.channel.send("**Error - `Missing Permissions Or Channel Is Not A Text Channel!`**");
    }
  }
};
