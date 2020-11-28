const Discord = require("discord.js");
const TikTok = require("tiktok-search");

module.exports = {
    config: {
        name: "tiktok-search",
        noalias: "",
        category: "info",
        description: "Shows tiktok accounts statistics",
        usage: "[username]",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
	if (!args[0]) {
        return message.channel.send(`<:No_:765603443472597012> **| Please provide me a valid TikTok username!**`)
    }
    TikTok.getUser(args[0])
        .then((out) => {
            console.log(out);
            const embed = new Discord.MessageEmbed()
                .setAuthor(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setColor("RANDOM")
                .setTitle(`${out.displayName} Tiktok Profile`)
                .setURL(out.profile)
                .setThumbnail(out.avatars.medium)
                .setDescription(`
                    **<a:rnaraa:765606794223157342> Username :** ${out.username}
                    **<a:rnaraa:765606794223157342> Display name :** ${out.displayName}
                    **<:Jwel2:765606426378240040> Followers :** ${out.followers} followers
                    **<:Jwel2:765606426378240040> Following :** ${out.following} following
                    **<a:Jwel_34:765606045681844254> Uploads :** ${out.videos || 0} uploads
                    **<a:Jwel_33:765603726618525748> Hearts :** ${out.hearts || 0} :hearts:
                    **<a:privv:765608032251150346> Private :** ${out.private ? "Yes :closed_lock_with_key:" : "Nope :unlock:"}
                    **<:17310:760566466763817031> Verified :** ${out.verified ? "Yes <:yes_:765603416360747028>" : "Nope <:No_:765603443472597012>"}
                    **<:ping:765235529582379008> Signature :** ${out.signature || "No Bio"}`)
            message.channel.send(embed)
        })
        .catch(e => {
            console.log(e)
            return message.channel.send("<:No_:765603443472597012> **| No results were found!**");
        });
    }
}

