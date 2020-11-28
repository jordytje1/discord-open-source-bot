const PhoneCall = require('../../structures/phone/PhoneCall');
const db = require('quick.db');

module.exports = {
    config: {
        name: 'phonecall',
        aliases: ['phone', 'call', 'pc'],
        usage: '[channel id | channel name]',
        category: 'phone',
        description: 'Starts A Phone Call With A Random Or Selected Server',
        accessableby: "everyone"
    },

    run: async (bot, message, args) => {
        let channelID = bot.channels.cache.get(args[0])
        let phonechannel = db.fetch(`pc_${message.guild.id}`)
        let phoneid = db.fetch('pclist')
        if (!phoneid) return message.channel.send("**No Channels Are Currently Allowing Phone Calls!**")

        let phonelist = phoneid.sort((a, b) => b.ChannelID - a.ChannelID).map(r => r)
            .map(r => r.ChannelID);
        if (message.channel.id !== phonechannel) {
            return message.channel.send('**You Can Start Call Only In The Set Phone Call Channel!**');
        }
        if (phonechannel === null) return message.channel.send("**Please Set A Phone Call Channel In Your Server To Call Somebody!**");
        if (inPhoneCall(message.channel)) return message.channel.send('**This Channel Is Already In A Phone Call!**')

        const channels = bot.channels.cache.filter(channel => channel.guild 
            && phonelist.includes(channel.id) == true
            && !message.guild.channels.cache.has(channel.id)
            && (channelID ? true : !inPhoneCall(channel)))

        if (message.channel.id !== phonechannel) {
            return message.channel.send('**You Can Start Call Only In The Set Phone Call Channel!**');
        }
        const inCall = bot.phone.some(call => [call.origin.id, call.recipient.id].includes(message.channel.id));
        if (inCall) {
            return message.channel.send('**This Channel Is Already In A Phone Call!**');
        }
        if (!channels.size) return message.channel.send('**No Channels Have Currently Allowed Phone Calls!**');
        let channel;
        if (channelID) {
            channel = channelID
            if (message.guild.channels.cache.has(channel.id)) return message.channel.send("**Cannot Start Phone Call In The Same Server!**")
            if (!channel || !channel.guild) return message.channel.send('**This Channel Does Not Exist, Try Again!**');
            if (!phonelist.includes(args[0])) {
                return message.channel.send('**This Channel Does Not Allow Phone Calls!**');
            }
            if (inPhoneCall(channel)) return message.channel.send('**This Channel Is Already In A Call!**');
        } else {
            channel = channels.random();
        }
        try {
            const id = `${message.channel.id}:${channel.id}`;
            bot.phone.set(id, new PhoneCall(bot, message.channel, channel));
            await bot.phone.get(id).start();
            return null;
        } catch (e) {
            console.log(e)
            return message.channel.send('**Failed To Start The Call, Try Again Later!**');
        }
        function inPhoneCall (channel) {
            return bot.phone.some(call => call.origin.id === channel.id || call.recipient.id === channel.id);
        }
    }
};