const { stripIndents } = require('common-tags');
const db = require('quick.db');

module.exports = {
    config: {
        name: 'phonebook',
        aliases: ['pb', 'pbook', 'phoneregister'],
        category: 'phone',
        usage: '[channel name | server name] (optional)',
        description: 'Searches For Phone-Enabled Servers!',
        accessableby: 'everyone'
    },
    run: async (bot, message, args) => {
        let phoneid = db.fetch('pclist')
        if (!phoneid) return message.channel.send("**No Channels Are Currently Allowing Phone Calls!**")

        let phonelist = phoneid.sort((a, b) => b.ChannelID - a.ChannelID).map(r => r)
            .map(r => r.ChannelID);
        let query = args.join(' ')
        if (args[0]) {
            const channels = bot.channels.cache.filter(channel => {
                return channel.guild
                    && phonelist.includes(channel.id)
                    && (channel.guild.name.toLocaleLowerCase() == (query.toLocaleLowerCase()) || channel.name == (query.toLocaleLowerCase()) || channel.id == query)
                    && !message.guild.channels.cache.has(channel.id);
            });
            if (!channels.size) return message.channel.send('**Could Not Find Any Results!**');
            return message.channel.send(stripIndents`
			**Results -** \`${channels.size}\`
			${channels.map(c => `\`${c.id}\` - **#${c.name} in ${c.guild.name}**`).slice(0, 10).join('\n')}
        `);
        } else {
            const channels = bot.channels.cache.filter(channel => channel.guild
                && phonelist.includes(channel.id) == true
                && !message.guild.channels.cache.has(channel.id));
            return message.channel.send(stripIndents`
        **Results -** \`${channels.size}\`
        ${channels.map(c => `\`${c.id}\` - **#${c.name} in ${c.guild.name}**`).slice(0, 10).join('\n')}
    `)
        }
    }
};