const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const { PREFIX } = require('../../config')
const musictriviajson = require('../../JSON/musictrivia.json')
const db = require('quick.db');

module.exports = {
    config: {
        name: 'musictrivia',
        category: 'music',
        aliases: ['musicquiz', 'mt'],
        description: "Music Trivia for You",
        usage: "[amount of songs]",
        accessableby: "everyone"
    },
    run: async (bot, message, args, ops) => {
        let prefix;
        let fetched = await db.fetch(`prefix_${message.guild.id}`);

        if (fetched === null) {
            prefix = PREFIX
        } else {
            prefix = fetched
        }

        const noperm = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("**❌ You do not have permissions to add money!**")
        if (!message.member.hasPermission("CONNECT", "SPEAK")) return message.channel.send(noperm)

        const serverQueue = ops.queue.get(message.guild.id)
        if (serverQueue) return message.channel.send("Cannot Play Music Trivia While Music is Playing!")
        const triviaData = {
            isTriviaRunning: false,
            wasTriviaEndCalled: false,
            triviaQueue: [],
            triviaScore: new Map()
        };
        ops.queue2.set(message.guild.id, triviaData)
        var { channel } = message.member.voice;
        const channeljoin = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("**Please Join A VC To Play Music Trivia!**")
        if (!channel)
            return message.channel.send(channeljoin);
        if (serverQueue && serverQueue.playing)
            return message.channel.send('**A quiz or a song is already running!**');
        triviaData.isTriviaRunning = true;

        if (!args[0]) return message.channel.send("**What is the number of songs you want the quiz to have?**")

        if (args[0] >= 5 && args[0] <= 15) {

            var videoDataArray = musictriviajson.songs;
            const randomXVideoLinks = getRandom(videoDataArray, args[0]);

            const infoEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('Starting Music Quiz')
                .setDescription(
                    `Get ready! There are ${args[0]} songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!
        You can end the trivia at any point by using the end-trivia command`
                );
            message.channel.send(infoEmbed);

            for (let i = 0; i < randomXVideoLinks.length; i++) {
                const song = {
                    url: randomXVideoLinks[i].url,
                    singer: randomXVideoLinks[i].singer,
                    title: randomXVideoLinks[i].title,
                    voiceChannel: channel
                };
                triviaData.triviaQueue.push(song);
            }
            const channelInfo = Array.from(
                message.member.voice.channel.members.entries()
            );
            channelInfo.forEach(user => {
                if (user[1].user.bot) return;
                triviaData.triviaScore.set(user[1].user.username, 0);
            });
        } else {
            return message.channel.send("**Please enter a number between 5 and 15**")
        }
        playQuizSong(triviaData.triviaQueue, message);


        async function playQuizSong(queue, message) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: channel,
                connection: null,
                songs: [],
                volume: 2,
                playing: true,
                loop: false
            };
            ops.queue3.set(message.guild.id, queueConstruct)
            try {
                const connection = await queue[0].voiceChannel.join();
                queueConstruct.connection = connection
                const dispatcher = connection
                    .play(
                        ytdl(queue[0].url, {
                            quality: 'highestaudio',
                            highWaterMark: 1 << 20
                        })
                    )
                    .on('start', function() {
                        dispatcher.setVolume(queueConstruct.volume);
                        let songNameFound = false;
                        let songSingerFound = false;

                        const filter = m =>
                            triviaData.triviaScore.has(m.author.username);
                        const collector = message.channel.createMessageCollector(filter, {
                            time: 30000
                        });

                        collector.on('collect', m => {
                            if (!triviaData.triviaScore.has(m.author.username))
                                return;
                            if (m.content.startsWith(prefix)) return;
                            if (m.content.toLowerCase() === queue[0].title.toLowerCase()) {
                                if (songNameFound) return;
                                songNameFound = true;

                                if (songNameFound && songSingerFound) {
                                    triviaData.triviaScore.set(
                                        m.author.username,
                                        triviaData.triviaScore.get(m.author.username) +
                                        1
                                    );
                                    m.react('✅');
                                    return collector.stop();
                                }
                                triviaData.triviaScore.set(
                                    m.author.username,
                                    triviaData.triviaScore.get(m.author.username) + 1
                                );
                                m.react('✅');
                            }
                            else if (
                                m.content.toLowerCase() === queue[0].singer.toLowerCase()
                            ) {
                                if (songSingerFound) return;
                                songSingerFound = true;
                                if (songNameFound && songSingerFound) {
                                    triviaData.triviaScore.set(
                                        m.author.username,
                                        triviaData.triviaScore.get(m.author.username) +
                                        1
                                    );
                                    m.react('✅');
                                    return collector.stop();
                                }

                                triviaData.triviaScore.set(
                                    m.author.username,
                                    triviaData.triviaScore.get(m.author.username) + 1
                                );
                                m.react('✅');
                            } else if (
                                m.content.toLowerCase() ===
                                queue[0].singer.toLowerCase() +
                                ' ' +
                                queue[0].title.toLowerCase() ||
                                m.content.toLowerCase() ===
                                queue[0].title.toLowerCase() +
                                ' ' +
                                queue[0].singer.toLowerCase()
                            ) {
                                if (
                                    (songSingerFound && !songNameFound) ||
                                    (songNameFound && !songSingerFound)
                                ) {
                                    triviaData.triviaScore.set(
                                        m.author.username,
                                        triviaData.triviaScore.get(m.author.username) +
                                        1
                                    );
                                    m.react('✅');
                                    return collector.stop();
                                }
                                triviaData.triviaScore.set(
                                    m.author.username,
                                    triviaData.triviaScore.get(m.author.username) + 2
                                );
                                m.react('✅');
                                return collector.stop();
                            } else {
                                return m.react('❌');
                            }
                        });

                        collector.on('end', function() {
                            if (triviaData.wasTriviaEndCalled) {
                                triviaData.wasTriviaEndCalled = false;
                                return;
                            }

                            const sortedScoreMap = new Map(
                                [...triviaData.triviaScore.entries()].sort(
                                    (a, b) => b[1] - a[1]
                                )
                            );

                            const song = `${capitalize_Words(
                                queue[0].singer
                            )}: ${capitalize_Words(queue[0].title)}`;

                            const embed = new MessageEmbed()
                                .setColor('GREEN')
                                .setTitle(`**The song was - ${song}**`)
                                .setDescription(
                                    getLeaderBoard(Array.from(sortedScoreMap.entries()))
                                );

                            message.channel.send(embed);
                            queue.shift();
                            dispatcher.end();
                            return;
                        });
                    })
                    .on('finish', function() {
                        if (queue.length >= 1) {
                            return playQuizSong(queue, message);
                        } else {
                            if (triviaData.wasTriviaEndCalled) {
                                queueConstruct.playing = false;
                                triviaData.isTriviaRunning = false;
                                queueConstruct.connection = null;
                                message.guild.me.voice.channel.leave();
                                return;
                            }
                            const sortedScoreMap = new Map(
                                [...triviaData.triviaScore.entries()].sort(
                                    (a, b) => b[1] - a[1]
                                )
                            );
                            const embed = new MessageEmbed()
                                .setColor('GREEN')
                                .setTitle(`**Music Quiz Results\n\n**`)
                                .setDescription(
                                    getLeaderBoard(Array.from(sortedScoreMap.entries()))
                                );
                            message.channel.send(embed);
                            queueConstruct.playing = false;
                            triviaData.isTriviaRunning = false;
                            triviaData.triviaScore.clear();
                            queueConstruct.connection = null;
                            message.guild.me.voice.channel.leave();

                            return;
                        }
                    });
            } catch (e) {
                console.error(e);
                ops.queue.delete(message.guild.id)
                await channel.leave();
                return message.channel.send("**Something Went Wrong!**");
            }
        }

        function getRandom(arr, n) {
            var result = new Array(n),
                len = arr.length,
                taken = new Array(len);
            if (n > len)
                throw new RangeError('getRandom: more elements taken than available');
            while (n--) {
                var x = Math.floor(Math.random() * len);
                result[n] = arr[x in taken ? taken[x] : x];
                taken[x] = --len in taken ? taken[len] : len;
            }
            return result;
        }

        function getLeaderBoard(arr) {
            if (!arr) return;
            let leaderBoard = '';

            leaderBoard = `👑   **${arr[0][0]}:** ${arr[0][1]}  points`;

            if (arr.length > 1) {
                for (let i = 1; i < arr.length; i++) {
                    leaderBoard =
                        leaderBoard + `\n\n   ${i + 1}: ${arr[i][0]}: ${arr[i][1]}  points`;
                }
            }
            return leaderBoard;
        }
        function capitalize_Words(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

    }
};