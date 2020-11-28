const Discord = require("discord.js");
const PlayStore = require("google-play-scraper");
const EmbedColor = ``;

module.exports = {
    config: {
        name: "playstore",
        aliases: ["googleplaystore", "googleps"],
        category: "info",
        description: "Show Playstore Application Information Of Your Given Name!",
        usage: "<Application Name>",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
	    if (!args[0])
      return message.channel.send(
        `Please Give Something To Search - ${message.author.username}`
      );

    PlayStore.search({
      term: args.join(" "),
      num: 1
    }).then(Data => {
      let App;

      try {
        App = JSON.parse(JSON.stringify(Data[0]));
      } catch (error) {
        return message.channel.send(
          `No Application Found - ${message.author.username}!`
        );
      }

      let Embed = new Discord.MessageEmbed()
        .setColor(EmbedColor || "RANDOM")
        .setThumbnail(App.icon)
        .setURL(App.url)
        .setTitle(`${App.title}`)
        .setDescription(App.summary)
        .addField(`Price`, App.priceText, true)
        .addField(`Developer`, App.developer, true)
        .addField(`Score`, App.scoreText, true)
        .setFooter(`Requested By ${message.author.username}`)
        .setTimestamp();

      return message.channel.send(Embed);
    });
    }
}
