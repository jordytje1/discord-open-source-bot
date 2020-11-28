module.exports = {
    config: {
        name: "message",
        aliases: [],
        category: "moderation",
        description: "Sending message to channel",
        usage: "<channel> <message>",
        accessableby: "Administrator"
    },
    run: async (bot, message, args) => {
        let channel = message.mentions.channels.first()
        if(!channel) {
            return message.channel.send(`mention channel please!`);
        }
    
        var args = message.content.split(' ').slice(2).join(' ');
     if(!args) {
         return message.channel.send(`you must spefic the message u want to send!`)
     }
    message.channel.send(`Sent the message to ${channel}`)
    channel.send(args)
    }
}