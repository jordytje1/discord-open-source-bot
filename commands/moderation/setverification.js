const db = require('quick.db');
const { PREFIX } = require('../../config');

module.exports = {
    config: {
        name: 'setverification',
        aliases: ['sv', 'setv', 'setverify'],
        category: 'moderation',
        description: 'Sets Verification Channel And Role',
        usage: '[channel name | channel ID | channel mention] <role name | role ID | role mention]',
        accessableby: 'Administrators'
    },
    run: async (bot, message, args) => {
        let prefix;
        let fetched = await db.fetch(`prefix_${message.guild.id}`);

        if (fetched === null) {
            prefix = PREFIX
        } else {
            prefix = fetched
        }

        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("**You Do Not Have Required Permissions! - [ADMINISTRATOR]!**");

        if (!args[0]) return message.channel.send("**Please Enter A Channel Name Where The User Should Be Asked To Verify!**");

        if (!args[1]) return message.channel.send("**Please Enter A Role Which Will Be Added After The User Is Verified!**");

        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name.toLowerCase() === args[0].toLocaleLowerCase());
        if (!channel || channel.type !== 'text') return message.channel.send("**Please Enter A Valid Channel!**");

        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(r => r.name.toLowerCase() === args[1].toLocaleLowerCase());
        if (!role) return message.channel.send("**Please Enter A Valid Role!**");

        let verifiedchannel = channel;

        try {
            let a = await db.fetch(`verificationchannel_${message.guild.id}`);
            let b = await db.fetch(`verificationrole_${message.guild.id}`);

            if (channel.id === a && role.id === b) {
                return message.channel.send('**This Channel is Already Set As Verification Channel!**');
            } else if (channel.id === a && role.id === b) {
                return message.channel.send("**This Role is Already Set As Verification Role!**");
            }
            else {
                message.guild.channels.cache.forEach(channel => {
                    if (channel.type === 'category' && channel.id === verifiedchannel.id) return;
                    let r = channel.permissionOverwrites.get(role.id);
                    if (!r) return;
                    if (r.deny.has("VIEW_CHANNEL") || r.deny.has("SEND_MESSAGES")) return;

                    channel.createOverwrite(message.guild.id, {
                        VIEW_CHANNEL: false
                    });

                    channel.updateOverwrite(role, {
                        VIEW_CHANNEL: true,
                        SEND_MESSAGES: true
                    });
                });

                verifiedchannel.updateOverwrite(role, {
                    SEND_MESSAGES: false,
                    VIEW_CHANNEL: false
                });
                bot.guilds.cache.get(message.guild.id).channels.cache.get(channel.id).send(`**Welcome To ${message.guild.name}!\nTo Get Verified Type - \`${prefix}verify\`**`);
                db.set(`verificationchannel_${message.guild.id}`, channel.id);
                db.set(`verificationrole_${message.guild.id}`, role.id);

                return message.channel.send(`**Verification Channel And Role Has Been Set Successfully in \`${channel.name}\`!**`);
            };
        } catch {
            return message.channel.send("**Error - `Missing Permissions Or Channel Is Not A Text Channel!`**");
        };
    }
};