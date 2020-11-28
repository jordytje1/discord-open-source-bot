const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { PREFIX } = require('../../config')

module.exports = {
    config: {
        name: "setbackground",
        aliases: ['setbg'],
        category: "economy",
        description: 'Sets Profile Background',
        usage: "[upload Image]",
        accessableby: 'everyone'
    },
    run: async (bot, message, args) => {

        let prefix;
        let fetched = await db.fetch(`prefix_${message.guild.id}`);

        if (fetched === null) {
            prefix = PREFIX
        } else {
            prefix = fetched
        }
        let user = message.author;
        let amount = 250;
        let bal = await db.fetch(`money_${user.id}`)

        let newBg = message.attachments.first()
        let fetchBg = await db.fetch(`bg_${user.id}`);
        if (!newBg) {
            if (fetchBg) {
                return message.channel.send(`**Profile Background Already Set As - \`${fetchBg}\`**`)
            } else {
                return message.channel.send("**You Need To Upload The Image To Set New Background!**")
            }
        }

        if (bal < amount) return message.channel.send(`**You Do Not Have Sufficient Money!\nPrice To Change Background - ${amount}**`)
        db.subtract(`money_${user.id}`, amount)
        db.set(`bg_${user.id}`, newBg.url)

        let embed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`Your Background Image Has Been Set`, user.displayAvatarURL())
            .setDescription(`**\`${amount}\` Has Been Deducted And Profile Background Has Been Set\nLink - \`${newBg.url}\`!**`)
            .setFooter(`To Check Background Type ${prefix}profile`)
        return message.channel.send(embed)
    }
}