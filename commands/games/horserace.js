const { createCanvas, loadImage } = require('canvas');
const db = require('quick.db');
const { stripIndents } = require('common-tags');
const { shuffle, randomRange, drawImageWithTint } = require('../../functions');
const horses = require('../../JSON/horserace.json');
const colors = ['gold', 'silver', '#cd7f32'];

module.exports = {
    config: {
        name: 'horserace',
        aliases: ['racehorse', 'hrace'],
        category: 'games',
        usage: 'Choose Horse Number',
        description: 'Bet On The Fastest Horse In A 6-Horse Race!',
        accessableby: 'everyone'
    },
    run: async (bot, message, args) => {
        const chosenHorses = shuffle(horses).slice(0, 6);
        await message.channel.send(stripIndents`
			**Choose a horse to bet on:** _(Type the number)_
			${chosenHorses.map((horse, i) => `**${i + 1}.** ${horse.name}`).join('\n')}
		`);
        const filter = res => {
            if (res.author.id !== message.author.id) return false;
            const num = Number.parseInt(res.content, 10);
            if (!num) return false;
            return num > 0 && num <= chosenHorses.length;
        };
        const messages = await message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000
        });
        if (!messages.size) return message.channel.send('Sorry, can\'t have a race with no bets!');
        const pick = chosenHorses[Number.parseInt(messages.first().content, 10) - 1];
        let results = [];
        for (const horse of chosenHorses) {
            results.push({
                name: horse.name,
                time: randomRange(horse.minTime, horse.minTime + 5) + Math.random()
            });
        }
        results = results.sort((a, b) => a.time - b.time);
        const leaderboard = await generateLeaderboard(chosenHorses, results);
        const win = results[0].name === pick.name;
        db.add(`games_${message.author.id}`, 1)
        return message.channel.send(win ? `Nice job! Your horse won!` : 'Better luck next time!', { files: [leaderboard] });

        async function generateLeaderboard(chosenHorses, results) {
            const lb = await loadImage("https://cdn.glitch.com/ccfc9e2e-e1fa-4dd0-838d-c3b5bb122b10%2Fleaderboard.png?v=1588572142541");
            const horseImg = await loadImage("https://cdn.glitch.com/ccfc9e2e-e1fa-4dd0-838d-c3b5bb122b10%2Fhorse.png?v=1588572375774");
            const canvas = createCanvas(lb.width, lb.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(lb, 0, 0);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const horse = chosenHorses.find(hor => hor.name === result.name);
                if (colors[i]) drawImageWithTint(ctx, horseImg, colors[i], 37, 72 + (49 * i), 49, 49);
                ctx.font = '25px Impact';
                ctx.fillText(formatTime(result.time), 755, 100 + (49 * i));
                ctx.font = '25px Impact';
                ctx.fillText(horse.name, 261, 88 + (51 * i));
            }
            return { attachment: canvas.toBuffer(), name: 'leaderboard.png' };
        }

        function formatTime(time) {
            const min = Math.floor(time / 60);
            const sec = Math.floor(time - (min * 60));
            const ms = time - sec - (min * 60);
            return `${min}:${sec.toString().padStart(2, '0')}.${ms.toFixed(4).slice(2)}`;
        }
    }
};