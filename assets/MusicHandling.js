const { MessageEmbed, Util } = require('discord.js');
const ytdl = require('ytdl-core');

const handleVideo = async (video, message, voiceChannel, playlist = false) => {
  const queue = message.client.playlists; 
  const song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`,
    channel: video.channel.title,
    channelurl: `https://www.youtube.com/channel/${video.channel.id}`,
    durationh: video.duration.hours,
    durationm: video.duration.minutes,
    durations: video.duration.seconds,
    thumbnail: video.thumbnails.default.url,
    author: message.author.username,
  }; // create the object for each song 
  if (!queue.has(message.guild.id)) { // check if there isn't a queue for the guild already
    const queueConstruct = { // create the object with information we require
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
      loop: false
    }; 
    queue.set(message.guild.id, queueConstruct); // set the object we just made
    queueConstruct.songs.push(song); // push the song object so we can use it later
    try {
      const connection = await voiceChannel.join(); // join the voice channel
      queueConstruct.connection = connection; // set the connection to be used globally
      play(message.guild, queueConstruct.songs[0]); // play the first song in the queue
    } catch (error) { // any errors, HANDLED
      queue.delete(message.guild.id);
      const embed = new MessageEmbed()
        .setAuthor('Error')
        .setDescription(`An error has occured: ${error}`)
        .setColor(message.guild.me.roles.highest.color || 0x00AE86);
      return message.channel.send(embed);
    }
  } else {
    if (queue.get(message.guild.id).songs.length >= message.settings.maxqueuelength) return message.client.embed('maxQueue', message);
    queue.get(message.guild.id).songs.push(song); // if the queue exists, it'll push the song object
    if (playlist) return; // if it's a playlist it wont do this so doesn't spam adding songs
    else {
      const embed = new MessageEmbed()
        .setAuthor('Song added!')
        .setDescription(`✅ **${song.title}** has been added to the queue!`)
        .setColor(message.guild.me.roles.highest.color || 0x00AE86);
      return message.channel.send(embed);
    }
  }
  return;
};
  
function play(guild, song) {
  const queue = guild.client.playlists;
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave(); // if there are no songs leave the channel
    queue.delete(guild.id); // and also remove the guild from the collection
    return;
  }
  const dispatcher = queue.get(guild.id).connection.play(ytdl(song.url, {quality:'lowest', filter:'audioonly'}, {passes: 3, volume: guild.voiceConnection.volume || 0.2})) // play the song
    .on('end', () => { // when the song ends
      if (!serverQueue.loop) { // if its not looped
        queue.get(guild.id).songs.shift(); // remove the first item from the queue, eg. first song
        setTimeout(() => { // wait 250ms before playing a song due to songs skipping
          play(guild, queue.get(guild.id).songs[0]); // play the song
        }, 250); 
      } else { // if it is looped it doens't remove the first item
        setTimeout(() => {  // wait 250ms before playing a song due to songs skipping
          play(guild, queue.get(guild.id).songs[0]); // play the song
        }, 250);		   
      }
    });
  dispatcher.setVolumeLogarithmic(queue.get(guild.id).volume / 5); // set the volume of the dispatcher
  const songdurm = String(song.durationm).padStart(2, '0'); // format the time
  const songdurh = String(song.durationh).padStart(2, '0'); // same ^
  const songdurs = String(song.durations).padStart(2, '0'); // same ^^
  
  const embed = new MessageEmbed() // create a message embed with all of the information
    .setTitle(song.channel)
    .setURL(song.channelurl)
    .setThumbnail(song.thumbnail)
    .setDescription(`[${song.title}](${song.url})`)
    .addField('__Duration__',`${songdurh}:${songdurm}:${songdurs}`, true)
    .addField('__Requested by__', song.author, true)
    .setColor(guild.member(guild.client.user.id).roles.highest.color || 0x00AE86);
  if (!serverQueue.loop) return queue.get(guild.id).textChannel.send(embed);
}