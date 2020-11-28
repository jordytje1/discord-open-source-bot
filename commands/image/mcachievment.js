const { MessageEmbed } = require('discord.js');
const Random = require("srod-v2");

module.exports = {
    config: {
        name: 'minecraftachievment',
        category: 'image',
        aliases: ['mcachievment'],
        description: 'Provide a text and I will return a mcachievment!',
        usage: "[text]",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
	if (!args[0]) return message.channel.send("Please Give Achievement Text!");
    let MinecraftAchievementEmbed = await Random.MinecraftAchievement(args.join(" "));
    return message.channel.send(MinecraftAchievementEmbed);
    }
};