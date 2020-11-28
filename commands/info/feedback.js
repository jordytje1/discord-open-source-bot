const Discord = require('discord.js');

module.exports = {
    config: {
        name: "feedback",
        aliases: [],
        category: "info",
        description: "Sends Feedback",
        usage: "<stars <text>",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
    let feedbackchannel = bot.channels.cache.get("774586422455435307");
    let feednumber = message.content.split(" ").slice(1)
    let feedstr = message.content.split(" ").slice(2).join(" ");
    let feednumber1 = parseInt(feednumber)
    if(!feedstr) return message.channel.send(`:x: u need to type how many stars`)
    if (!feednumber1 || isNaN(parseInt(feednumber)) || parseInt(feednumber)<=0 || parseInt(feednumber)>5) return message.channel.send(`:x:`)
    if(feednumber1>5) return message.channel.send(`:x: u need to chose between 1-5`)
    let stararray = []
    for(i=0; i<feednumber1; i++) {
      stararray.push("⭐")
    }
    let embed = new Discord.MessageEmbed()
    .setTitle(`New review`)
    .addField(`Stars:`, `${stararray.join("")}`)
    .addField(`Comment:`, `${feedstr}`)
    .addField(`From:`, `${message.author}`)
    .setThumbnail(message.author.displayAvatarURL({dynamic : true}))
    .setTimestamp()
    .setFooter(`${message.guild.name}`);
    await feedbackchannel.send(embed)
	await message.channel.send("Feedback successfully send to Bot Support Feedback Channel!")
    }
}