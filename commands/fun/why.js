const { MessageEmbed } = require("discord.js");
const Random = require("srod-v2");

module.exports = {
    config: {
        name: "why",
        category: "fun",
        noalias: [''],
        description: "Sending random why",
        usage: "[text]",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
	  let Why = await Random.GetWhy("BLUE");
	  message.channel.send(Why);
  }
};
