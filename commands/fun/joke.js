const { MessageEmbed } = require("discord.js");
const Random = require("srod-v2");

module.exports = {
    config: {
        name: "joke",
        category: "fun",
        noalias: [''],
        description: "Sending random joke",
        usage: "[text]",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
  	let Joke = await Random.GetJoke("BLUE");
  	message.channel.send(Joke);
  }
};
