const { oneLine } = require('common-tags');
const request = require('node-superfetch');
const { shuffle, verify } = require('../../functions');
const choices = ['A', 'B', 'C', 'D'];
const db = require('quick.db')

module.exports = {
  config: {
    name: 'duelquiz',
    aliases: ['dq', 'quizduel', 'qd'],
    category: 'games',
    usage: '[username | mention | nickname | ID] <amount>',
    description: 'Answer A Series Of Quiz Questions Against An Human',
    accessableby: "everyone"
  },

  run: async (bot, message, args, ops) => {
    let opponent = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === args.join(' ').toLocaleLowerCase()) || message.guild.members.cache.find(r => r.displayName.toLowerCase() === args.join(' ').toLocaleLowerCase());
    if (!opponent) return message.channel.send("**Please Enter A Valid User!**");
    let maxPts = args[1]
    if (maxPts <= 0 || maxPts >= 9) return message.channel.send("**Please Enter A Number Between 1-8!**")
    if (opponent.user.bot) return message.channel.send('**Cannot Play Against Bots!**');
    if (opponent.user.id === message.author.id) return message.channel.send('**Cannot Play Against Yourself!**');
    const current = ops.games.get(message.channel.id);
    if (current) return message.channel.send(`**Please Wait Until  The Current Game of \`${current.name}\` Is Finished!**`);
    ops.games.set(message.channel.id, { name: 'duelquiz' });
    try {
      await message.channel.send(`**${opponent}, Do You Accept This Challenge?**`);
      const verification = await verify(message.channel, opponent);
      if (!verification) {
        ops.games.delete(message.channel.id);
        return message.channel.send(`**Looks Like ${opponent} Doesnt Wants To Play!**`);
      }
      let winner = null;
      let userPoints = 0;
      let oppoPoints = 0;
      let time  = 20 * 1000;
      let lastTurnTimeout = false;
      while (!winner) {
        const question = await fetchQuestion();
        await message.channel.send({
          embed: {
            title: `Trivia Question!`,
            color: "GREEN",
            thumbnail: message.guild.iconURL(),
            description: `**${question.question}\nPlease Choose A Number Within ${time / 1000}s**\n\n ${question.answers.map((answer, i) => `**${choices[i]} -** ${answer}`).join('\n')}`,
            fields: [
              { name: '**Difficulty**', value: `\`${question.difficulty}\``, inline: true },
              { name: '**Category**', value: `\`${question.category}\``, inline: true }
            ],
            footer: { text: "Please Choose The Letter To Answer!" }
          }
        });
        const answered = [];
        const filter = res => {
          const choice = res.content.toUpperCase();
          if (!choices.includes(choice) || answered.includes(res.author.id)) return false;
          if (![message.author.id, opponent.id].includes(res.author.id)) return false;
          answered.push(res.author.id);
          if (question.answers[choices.indexOf(res.content.toUpperCase())] !== question.correct) {
            message.channel.send(`**${res.author}, That's Incorrect!**`).catch(() => null);
            return false;
          }
          return true;
        };
        const messages = await message.channel.awaitMessages(filter, {
          max: 1,
          time: 20000
        });
        if (!messages.size) {
          await message.channel.send(`**It Was ${question.correct}!**`);
          if (!answered.length) {
            if (lastTurnTimeout) {
              winner = 'time';
              break;
            } else {
              lastTurnTimeout = true;
              continue;
            }
          }
          continue;
        }
        const result = messages.first();
        const userWin = result.author.id === message.author.id;
        if (userWin) ++userPoints;
        else ++oppoPoints;
        if (userPoints >= maxPts) winner = message.author;
        else if (oppoPoints >= maxPts) winner = opponent;
        const score = oneLine`
					${userWin ? '**' : ''}${userPoints}${userWin ? '**' : ''} -
					${userWin ? '' : '**'}${oppoPoints}${userWin ? '' : '**'}
				`;
        await message.channel.send(`**Nice One, ${result.author}! The Score Is Now ${score}!**`);
        if (lastTurnTimeout) lastTurnTimeout = false;
      }
      db.add(`games_${opponent.id}`, 1)
      db.add(`games_${message.author.id}`, 1)
      ops.games.delete(message.channel.id);
      if (winner === 'time') return message.channel.send('**Game Ended Due To Inactivity!**');
      if (!winner) return message.channel.send('**Nobody Won!**');
      return message.channel.send(`**Congrats, ${winner}, You Won!**`);
    } catch (err) {
      ops.games.delete(message.channel.id);
      return message.channel.send("**Trivia Not Available!**");
    }

    async function fetchQuestion() {
      const { body } = await request
        .get('https://opentdb.com/api.php')
        .query({
          amount: 1,
          type: 'multiple',
          encode: 'url3986'
        });
      if (!body.results) return fetchQuestion();
      const question = body.results[0];
      const category = decodeURIComponent(question.category);
      const difficulty = decodeURIComponent(question.difficulty);
      const answers = question.incorrect_answers.map(answer => decodeURIComponent(answer.toLowerCase()));
      const correct = decodeURIComponent(question.correct_answer.toLowerCase());
      answers.push(correct);
      const shuffled = shuffle(answers);
      return {
        question: decodeURIComponent(question.question),
        answers: shuffled,
        correct,
        category,
        difficulty
      };
    }
  }
}