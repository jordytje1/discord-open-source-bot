const weather = require('weather-js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    config: {
        name: "weather",
        noalias: "",
        category: "info",
        description: "Shows weather of a city",
        usage: "[city name]",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
        if(!args[0]) return message.channel.send('**Please Enter A City Name!**')
      
        weather.find({search: args.join(" "), degreeType: 'C'}, function(err, result){
        
        if(err) message.channel.send(err.message);

        if(result.length === 0) {
            message.channel.send('**Please Enter A Valid Location.**')
            return undefined;
        }

            var current = result[0].current;
            var location = result[0].location;

            const embed = new MessageEmbed()
                .setDescription(`**${current.skytext}**`)
                .setAuthor(`Weather for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor("GREEN")
                .addField('**Timezone**', `UTC ${location.timezone}`, true)
                .addField('**Degree Type**', `${location.degreetype}`, true)
                .addField('**Temperature**', `${current.temperature} Degrees`, true)
                .addField('**Feels Like**', `${current.feelslike} Degrees`, true)
                .addField('**Winds**', `${current.winddisplay}`, true)
                .addField('**Humidity**', `${current.humidity}%`, true)
                .addField('**Date**', `${current.date}`, true)
                .addField('**Day**', `${current.day}`, true)
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()

            message.channel.send({embed})

        });
    }
}

