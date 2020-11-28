module.exports = {
    config: {
        name: "stopmusictrivia",
        aliases: ["st", "smt"],
        category: "music",
        description: "Stops Current Trivia",
        usage: " ",
        accessableby: "everyone"
    },
    run: async (bot, message, args, ops) => {
        const triviaData = ops.queue2.get(message.guild.id)
        try {
            if (!triviaData.isTriviaRunning)
                return message.channel.send('No trivia is currently running');

            if (message.guild.me.voice.channel !== message.member.voice.channel) {
                return message.channel.send("Join the trivia's channel and try again");
            }

            if (!triviaData.triviaScore.has(message.author.username)) {
                return message.channel.send(
                    'You need to participate in the trivia in order to end it'
                );
            }

            triviaData.triviaQueue.length = 0;
            triviaData.wasTriviaEndCalled = true;
            triviaData.triviaScore.clear();
            message.guild.me.voice.channel.leave()
          return message.channel.send('⏩ Music Trivia Skipped');
        }
        catch {        
            return; 
        }
    }
};