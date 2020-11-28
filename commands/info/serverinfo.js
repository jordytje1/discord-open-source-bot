const { MessageEmbed } = require("discord.js")
const { greenlight } = require("../../JSON/colours.json")

module.exports = {
    config: {
        name: "serverinfo",
        description: "Pulls the serverinfo of the guild!",
        usage: " ",
        category: "info",
        accessableby: "everyone",
        aliases: ["sinfo"]
    },
    run: async (bot, message, args) => {
		
		const online = message.guild.members.cache.filter(m =>
  			m.presence.status === 'online'
			).size

		const idle = message.guild.members.cache.filter(m =>
  			m.presence.status === 'idle'
			).size

		const offline = message.guild.members.cache.filter(m =>
  			m.presence.status === 'offline'
			).size
		
		const dnd = message.guild.members.cache.filter(m =>
  			m.presence.status === 'dnd'
			).size

		const text = message.guild.channels.cache.filter(r => r.type === "text").size
		const voice = message.guild.channels.cache.filter(r => r.type === "voice").size
		const chs = message.guild.channels.cache.size
		
		const roles = message.guild.roles.cache.size
		
        let owner = [];
        await bot.users.fetch(message.guild.ownerID).then(o => owner.push(o.tag))
        try {
            let embed = new MessageEmbed()
                .setColor("BLACK")
                .setTitle("Server Info")
                .setThumbnail(message.guild.iconURL())
                .setAuthor(`${message.guild.name} Info`, message.guild.iconURL())
                .addField(":crown: Guild Owner", `${owner}`, false)
                .addField(":id: Server ID", `${message.guild.id}`)
                .addField(":calendar: Created At", message.guild.createdAt.toLocaleString(), false)
                .addField(`:speech_balloon: Channels **(${chs})**`, ` \`\`\`\**${text}** Text \n **${voice}** Voice \`\`\`\ `, false)
                .addField(`:busts_in_silhouette: Members (${message.guild.memberCount})**`, ` \`\`\`\ **${online}** Online \n **${idle}** Idle \n **${dnd}** Dnd \n> **${offline}** Offline \n **${message.guild.premiumSubscriptionCount}** Boosts \`\`\`\ `, false)
				.addField(`Roles (${roles})`, `To view all roles use command **serverroles**`, false)
				.setTimestamp()
      			.setFooter(`Requested by: ${message.author.username}`, message.author.avatarURL);
            message.channel.send(embed);
        }
        catch {
            return message.channel.send('Something Went Wrong!')
        }
    }
}
