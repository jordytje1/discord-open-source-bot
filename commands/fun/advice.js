const { MessageEmbed } = require("discord.js");
const Random = require("srod-v2");

module.exports = {
    config: {
        name: "advice",
        category: "fun",
        noalias: [''],
        description: "Sending random advice",
        usage: "[text]",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
  	let Advice = await Random.GetAdvice("BLUE");
  	message.channel.send(Advice);
  }
};
