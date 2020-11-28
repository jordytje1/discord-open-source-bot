const { MessageEmbed } = require("discord.js");
const Random = require("srod-v2");

module.exports = {
    config: {
        name: "fact",
        category: "fun",
        noalias: [''],
        description: "Sending random fact",
        usage: "[text]",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
 	 let Fact = await Random.GetFact("BLUE");
 	 message.channel.send(Fact);
  }
};
