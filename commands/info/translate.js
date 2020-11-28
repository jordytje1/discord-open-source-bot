const { MessageEmbed } = require('discord.js');
const { yandex_API } = require('../../config');
const ISO6391 = require('iso-639-1');
const fetch = require('node-fetch');

module.exports = {
    config: {
        name: 'translate',
        description: 'Translate to any language using yandex translation service(only supported lanugages)',
        noalias: [""],
        category: "info",
        usage: "[language]| next message(text)",
        accessableby: "everyone"
    },
    run: async (bot, message, args) => {
        let list = "Azerbaijan,	Malayalam, Albanian, Maltese, Amharic, Macedonian, English,	Maori, Arabic, Marathi, Armenian, Mari, Afrikaans, Mongolian, Basque, German, Bashkir, Nepali, Belarusian, Norwegian, Bengali, Punjabi, Burmese, Papiamento, Bulgarian, Persian, Bosnian, Polish, Welsh, Portuguese, Hungarian, Romanian, Vietnamese, Russian, Haitian (Creole), Cebuano, Galician,	Serbian, Dutch,	Sinhala, Hill Mari,	Slovakian, Greek, Slovenian, Georgian, Swahili, Gujarati, Sundanese, Danish, Tajik, Hebrew, Thai, Yiddish, Tagalog, Indonesian, Tamil, Irish, Tatar, Italian, Telugu, Icelandic, Turkish, Spanish, Udmurt, Kazakh, Uzbek, Kannada, Ukrainian, Catalan, Urdu, Kyrgyz, Finnish, Chinese, French, Korean, Hindi, Xhosa, Croatia, Khmer,	Czech, Laotian, Swedish, Latin,	Scottish, Latvian, Estonian, Lithuanian, Esperanto, Luxembourgish, Javanese, Malagasy, Japanese, Malay"
        
        if (!args[0]) return message.channel.send("Type A Language to translate")

        const langCode = ISO6391.getCode(args[0]);
        const langName = ISO6391.getName(langCode)
        if (langCode === '') {
            const sentMessage2 = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("**This Language is Not Supported!**")
        const sentMessage = await message.channel.send(sentMessage2)

            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("List Of Supported Languages!")
                .setThumbnail(message.guild.iconURL())
                .addField('**These Are The Supported Languages!**', list)
            return sentMessage.edit(embed);
        };
        const sembed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("**Translator Activated, Put Some Text In The Next Line To Get The Translated results!**")
        await message.channel.send(sembed)

        try {
            const filter = msg => msg.content.length > 0 && msg.content.length < 3000;
            let response = await message.channel.awaitMessages(filter, {
                max: 1,
                maxProcessed: 1,
                time: 90000,
                errors: ['time']
            });
            var text = response.first().content;

        } catch (e) {
            const embed1 = new MessageEmbed()
                .setColor("GREEN")
                .setDescription('**You Did Not Enter Any Text!**')
            return message.channel.send(embed1);
        };

        try {
            var res = await fetch(
                `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandex_API}&text=${encodeURI(
                    text
                )}&lang=${langCode}`
            );
            const json = await res.json();
            message.channel.send(embedTranslation(json.text[0]));
        } catch (e) {
            const sembed1 = new MessageEmbed()
                .setColor("GREEN")
                .setDescription('**Something Went Wrong While Trying To Translate The Text!**')
            return message.channel.send(sembed1);
        };

        function embedTranslation(text) {
            return new MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Translated To ${langName}`)
                .setDescription(`${text}`)
                .setFooter(message.guild.name, message.guild.iconURL());
        }
    }
};