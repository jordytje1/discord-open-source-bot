const { stripIndents } = require('common-tags');
const { verify } = require('../../functions');
const blankEmoji = '⚪️';
const playerOneEmoji = '🔴';
const playerTwoEmoji = '🟡';
const db = require("quick.db");
const nums = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣'];

module.exports = {
    config: {
        name: 'connectfour',
        aliases: ['connect4', 'c4'],
        category: 'games',
        usage: '[name | nickname | mention | ID] <Connect 4 H or V Dots> ',
        description: 'Play A Game Of Connect Four With Another User Until Four Horizontal Or Vertical Lines Are Connected',
        accessableby: "everyone"
    },
    run: async (bot, message, args, ops) => {
        if (!args[0]) return message.channel.send("**Please Enter A User!**");
        let opponent = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(r => r.user.username.toLowerCase() === args[0].toLocaleLowerCase()) || message.guild.members.cache.find(r => r.displayName.toLowerCase() === args[0].toLocaleLowerCase());
        if (!opponent) return message.channel.send("**Please Enter A Valid User!**");
        if (opponent.user.bot) return message.channel.send('**Bots May Not Be Played Against!**');
        if (opponent.user.id === message.author.id) return message.channel.send('**Cannot Play Against Yourself!**');
        const current = ops.games.get(message.channel.id);
        if (current) return message.channel.send(`**Please Wait Until The Current Game Of \`${current.name}\` Is Finished!**`);
        ops.games.set(message.channel.id, { name: 'connectfour' });
        try {
            await message.channel.send(`**${opponent}, Do You Accept This Challenge?**`);
            const verification = await verify(message.channel, opponent);
            if (!verification) {
                ops.games.delete(message.channel.id);
                return message.channel.send(`**Looks Like ${opponent} Doesnt Wants To Play!**`);
            }
            const board = generateBoard();
            let userTurn = true;
            let winner = null;
            const colLevels = [5, 5, 5, 5, 5, 5, 5];
            let lastTurnTimeout = false;
            while (!winner && board.some(row => row.includes(null))) {
                const user = userTurn ? message.author : opponent;
                const sign = userTurn ? 'user' : 'oppo';
                await message.channel.send(stripIndents`
					**${user}, Which Column Do You Want To Pick? Type \`end\` To Forfeit!**
					${displayBoard(board)}
					${nums.join('')}
				`);
                const filter = res => {
                    if (res.author.id !== user.id) return false;
                    const choice = res.content;
                    if (choice.toLowerCase() === 'end') return true;
                    const i = Number.parseInt(choice, 10) - 1;
                    return board[colLevels[i]] && board[colLevels[i]][i] !== undefined;
                };
                const turn = await message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 60000
                });
                if (!turn.size) {
                    if (lastTurnTimeout) {
												winner = 'time';
						            break;
					          } else {
						          lastTurnTimeout = true;
						          userTurn = !userTurn;
						          continue;
					          }
                }
                const choice = turn.first().content;
                if (choice.toLowerCase() === 'end') {
                    winner = userTurn ? opponent : message.author;
                    await message.channel.send(`**${winner} Won!**`)
                    ops.games.delete(message.channel.id)
                }
                const i = Number.parseInt(choice, 10) - 1;
                board[colLevels[i]][i] = sign;
                colLevels[i] -= 1;
                if (verifyWin(board)) winner = userTurn ? message.author : opponent;
				        if (lastTurnTimeout) lastTurnTimeout = false;
                userTurn = !userTurn;
            }
            db.add(`games_${opponent.id}`, 1)
            db.add(`games_${message.author.id}`, 1)
            ops.games.delete(message.channel.id);
            if (winner === 'time') return message.channel.send('**Game Ended Due To Inactivity!**');
            return message.channel.send(winner ? `**Congrats, ${winner}!**` : '**Its A Draw!**');
        } catch (err) {
            ops.games.delete(message.channel.id);
            throw err;
        }


        function checkLine(a, b, c, d) {
            return (a !== null) && (a === b) && (a === c) && (a === d);
        }

        function verifyWin(bd) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 7; c++) {
                    if (checkLine(bd[r][c], bd[r + 1][c], bd[r + 2][c], bd[r + 3][c])) return bd[r][c];
                }
            }
            for (let r = 0; r < 6; r++) {
                for (let c = 0; c < 4; c++) {
                    if (checkLine(bd[r][c], bd[r][c + 1], bd[r][c + 2], bd[r][c + 3])) return bd[r][c];
                }
            }
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 4; c++) {
                    if (checkLine(bd[r][c], bd[r + 1][c + 1], bd[r + 2][c + 2], bd[r + 3][c + 3])) return bd[r][c];
                }
            }
            for (let r = 3; r < 6; r++) {
                for (let c = 0; c < 4; c++) {
                    if (checkLine(bd[r][c], bd[r - 1][c + 1], bd[r - 2][c + 2], bd[r - 3][c + 3])) return bd[r][c];
                }
            }
            return null;
        }

        function generateBoard() {
            const arr = [];
            for (let i = 0; i < 6; i++) {
                arr.push([null, null, null, null, null, null, null]);
            }
            return arr;
        }

        function displayBoard(board) {
            return board.map(row => row.map(piece => {
                if (piece === 'user') return playerOneEmoji;
                if (piece === 'oppo') return playerTwoEmoji;
                return blankEmoji;
            }).join('')).join('\n');
        }
    }
};