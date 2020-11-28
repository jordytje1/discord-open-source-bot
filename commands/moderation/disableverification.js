const db = require('quick.db');

module.exports = {
    config: {
        name: 'disableverification',
        aliases: ['dv', 'disableverify'],
        category: 'moderation',
        description: 'Disable\'s Server Verification System',
        usage: ' ',
        accessableby: 'Administrators'
    },
    run: async (bot, message, args) => {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("**You Do Not Have Required Permissions! - [ADMINISTRATOR]!**");

        let verifychannel = db.fetch(`verificationchannel_${message.guild.id}`);
        if (!verifychannel || verifychannel === null) return;
        if(!message.guild.channels.cache.has(verifychannel)) return;

        let verifiedchannel = message.guild.channels.cache.get(verifychannel);
        if (!verifiedchannel) return;
        
        let verifyrole = db.fetch(`verificationrole_${message.guild.id}`);
        if (!verifyrole || verifyrole === null) return;
        if(!message.guild.roles.cache.has(verifyrole)) return;

        let role = message.guild.roles.cache.get(verifyrole);
        if (!role) return;

        try {
            message.guild.channels.cache.forEach(channel => {
                if (channel.type === 'category' && channel.id === verifiedchannel.id) return;
                let r = channel.permissionOverwrites.get(role.id);
                if (!r) return;
                if (r.deny.has("VIEW_CHANNEL") || r.deny.has("SEND_MESSAGES")) return;

                channel.createOverwrite(message.guild.id, {
                    VIEW_CHANNEL: true
                });

                channel.updateOverwrite(role, {
                    VIEW_CHANNEL: null,
                    SEND_MESSAGES: null
                });
            });

            verifiedchannel.updateOverwrite(role, {
                SEND_MESSAGES: null,
                VIEW_CHANNEL: null
            });

            verifiedchannel.delete();
            db.delete(`verificationchannel_${message.guild.id}`);
            db.delete(`verificationrole_${message.guild.id}`);
            return message.channel.send(`**Disabled Verification System in ${message.guild.name}!**`);
        } catch {
            return message.channel.send('**Something Went Wrong!**')
        }
    }
};