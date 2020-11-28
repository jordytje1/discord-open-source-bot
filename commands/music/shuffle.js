const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: "shuffle",
    noalias: "",
    category: "music",
    description: "Shuffles Music in Queue",
    usage: " ",
    accessableby: "everyone"
  },
  run: async (bot, message, args, ops) => {
    const { channel } = message.member.voice;
    if (!channel) return message.channel.send('I\'m sorry but you need to be in a voice channel to shuffle music!');

    if (message.guild.me.voice.channel !== message.member.voice.channel) {
      return message.channel.send("**You Have To Be In The Same Channel With The Bot!**");
    }
    const serverQueue = ops.queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send('❌ **Nothing playing in this server**');

    if (!serverQueue.songs || serverQueue.songs.length === 1)
      return message.channel.send('**There Are No Songs In Queue**');
  try {
    shuffleQueue(serverQueue.songs);

    const titleArray = [];
    serverQueue.songs.map(obj => {
      titleArray.push(obj.title);
    });
    var queueEmbed = new MessageEmbed()
      .setColor('GREEN')
      .setTitle('New Music Queue');
    for (let i = 0; i < titleArray.length; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
    }
    return message.channel.send(queueEmbed);
    } catch {
      serverQueue.connection.dispatcher.end();
      return message.channel.send("**Something Went Wrong!**")
    }
  }
}


function shuffleQueue(queue) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}