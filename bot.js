const Discord = require('discord.js');
const Splitwise = require('splitwise')
const client = new Discord.Client();

require('dotenv').config();

const userTable = {
    'marko___': {
        name: 'Marko',
        id: '17012877'
    },
    'misterbiscuit': {
        name: 'Seung-Jin',
        id: '35562250'
    },
    'heromoo': {
        name: 'Hiro',
        id: '18070776'
    }
}

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
    const requester = lookup(msg.author.username)

    let splitSpec = {};

    try {
        splitSpec = parseSplitCommand(requester, args);
        console.log(splitSpec)
    } catch (err) {
        msg.reply(err.message);
        return
    }

    const sw = Splitwise({
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET
    })

    const group_id = process.env.SPLITWISE_GROUP_ID



    users = splitSpec.splitWith.map(name => {
        return {
            user_id: lookupId(name),
            owed_share: String(Math.floor(splitSpec.amountOwed / splitSpec.splitWith.length)),
            paid_share: '0.00'
        }
    })

    users.push({
        user_id: requester.id,
        owed_share: '0.00',
        paid_share: String(splitSpec.amountOwed)
    })


    sw.createExpense({
        users: users,
        cost: splitSpec.amountOwed,
        description: `Requested by ${requester.name} from the discord chat`,
        payment: false,
        split_equally: true,
        group_id: group_id,
    }).then(
        msg.reply('💰 The expense was recorded on Splitwise... go swed 🌱)')
    )
}

function lookupId(name) {
    return Object.values(userTable).filter(user => user.name.toLowerCase() == name)[0].id
}

function parseSplitCommand(requester, args) {

    const users = ['marko', 'hiro', 'seung-jin']

    args = args.map(name => name == 'luke' ? 'seung-jin' : name)

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
    return userTable[discordUsername]
}

client.login(process.env.TOKEN);