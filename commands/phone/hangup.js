module.exports = {
    config: {
        name: 'hangup',
        category: 'phone',
        aliases: ['hungup', 'leavecall', 'endcall'],
        description: 'Hangs up the current phone call.',
        accessableby: 'everyone',
        usage: ' '
    },
    run: async (bot, message, args) => {
        const origin = bot.phone.find(call => call.origin.id === message.channel.id);
        const recipient = bot.phone.find(call => call.recipient.id === message.channel.id);
        if (!origin && !recipient) return message.channel.send('**☎️ This Channel Is Not In A Phone Call!**');
        const call = origin || recipient;
        if (!call.active) return message.channel.send('**☎️ This Call Is Not Currently Active!**');
        if (call.ownerOrigin && !bot.isOwner(message.author)) {
            return message.channel.send('**☎️ You Cannot Hang Up In An Admin Call!**');
        }
        const nonQuitter = message.channel.id === call.origin.id ? call.recipient : call.origin;
        await call.hangup(nonQuitter);
        return null;
    }
}