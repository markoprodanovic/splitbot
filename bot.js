const Discord = require('discord.js');
const client = new Discord.Client();

require('dotenv').config();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    const args = msg.content.split(' ')
    if (args[0].toLowerCase() == '!split') {
        split(msg, args);
    }
});

function split(msg, args) {
    requester = lookup(msg.author.username)

    try {
        splitSpec = parseSplitCommand(requester, args);
        msg.reply('Split spec created')
        console.log(splitSpec)
    } catch (err) {
        msg.reply(err.message);
        return
    }
}

function parseSplitCommand(requester, args) {

    const users = ['marko', 'hiro', 'luke']

    // must have 4 or 5 arguments to be valid
    if (args.length < 3 || args.length > 4) {
        throw Error('⚠️ Must have between 4 and 5 arguments: ex. "!split $30 hiro marko luke"')
    }

    let expense_amount = args[1];

    const regex = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;

    if (!regex.test(expense_amount)) {
        // number is invalid
        throw Error('⚠️ Please provide amount in CAD as second argument (max 2 decimals)')
    }

    if (!users.includes(args[2]) || (args.length == 4 && !users.includes(args[3]))) {
        throw Error('⚠️ Last arguments need to be names of swamp legends to split money with - can be: [Hiro, Marko, Luke]')
    }

    return {
        requester: requester,
        amountOwed: Number(expense_amount),
        splitWith: args.slice(2)
    }
}

function lookup(discordUsername) {
    nameTable = {
        'marko___': 'marko',
        'misterbiscuit': 'luke',
        'heromoo': 'hiro'
    }
    return nameTable[discordUsername]
}

client.login(process.env.TOKEN);