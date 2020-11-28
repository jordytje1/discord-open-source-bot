const Discord = require("discord.js");
const ownerid = ["733996780823248956"];
const ownerid2 = ["733996780823248956"];
const hastebin = require('hastebin.js');
const haste = new hastebin({ /* url: 'hastebin.com */ });

module.exports = {
  config: {
    name: "serverhastelist",
    aliases: ["shastelist"],
    category: "owner",
    description: "",
    usage: " ",
    accessableby: "Owner"
  },
  run: async (bot, message, args) => {
    if (message.author.id == ownerid || ownerid2) {
		let arr = new Array();
        bot.guilds.cache.forEach(async servers => {
arr.push(`

--> Server Info Of ${servers.name} <--

Server Name: ${servers.name}

Member Count: ${servers.memberCount}

Server ID: ${servers.id}  

---> Info Of ${servers.name} Ends Here <--- 

`)
        })
        console.log(arr)
        const link = haste.post(arr).then(link =>   {
        let upload = new Discord.MessageEmbed()
        .setAuthor(message.author.username , message.author.displayAvatarURL())
        .setDescription(`[Uploaded](${link})`)
        .setFooter(message.guild.name , message.guild.iconURL())
        message.channel.send(upload)
        })
  }
  }
};
