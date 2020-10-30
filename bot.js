const Discord = require('discord.js');
const Splitwise = require('splitwise')
const client = new Discord.Client();

require('dotenv').config();

const userTable = {
    'marko___': {
        name: 'Marko',
        id: '17012877',
        emoji: '<:761021985765457940>'
    },
    'misterbiscuit': {
        name: 'Seung-Jin',
        id: '35562250',
        emoji: '<:761018980461838376>'
    },
    'heromoo': {
        name: 'Hiro',
        id: '18070776',
        emoji: '<:761018492350234624>'
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

    const splitList = splitExpense(splitSpec.expense, splitSpec.splitWith.length + 1);

    // pop off the first element as the requesters contribution
    let requesterShare = splitList.pop();


    let users = splitSpec.splitWith.map(name => {
        return {
            user_id: lookupId(name),
            owed_share: String(splitList.pop()),
            paid_share: '0.00'
        }
    })

    users.push({
        user_id: requester.id,
        owed_share: String(requesterShare),
        paid_share: String(splitSpec.expense)
    })

    console.log(users)


    sw.createExpense({
        users: users,
        cost: splitSpec.expense,
        description: `Requested by ${requester.name} from the discord chat`,
        payment: false,
        split_equally: true,
        group_id: group_id,
    }).then(
        msg.reply(`💸 Expense of $${splitSpec.expense} CAD was recorded on Splitwise`)
    ).then(() => {
        let emojiList = users.map(user => {
            const id = user.user_id;
            return lookupEmoji(id);
        })
        return emojiList
    }).then(emojis => {
        let emojiString = emojis.join(' ')
        msg.reply(`💰 Split between: ${emojiString}`)
    })
}

function lookupEmoji(id) {
    return Object.values(userTable).filter(user => user.id == id)[0].emoji
}

function splitExpense(expense, numPeople) {
    let initialAmount = Math.floor((expense / numPeople) * 100) / 100;

    let res = []

    for (let i = 0; i < numPeople; i++) {
        res.push(initialAmount)
    }

    let remainder = expense - (initialAmount * numPeople);

    remainder = remainder.toFixed(2)

    console.log(remainder)

    let j = 0
    while (remainder > 0) {
        res[j] += 0.01;
        remainder -= 0.01;
        j = (j + 1) % res.length;
    }

    return res
}

function financial(x) {
    return Number.parseFloat(x).toFixed(2);
}


function lookupId(name) {
    return Object.values(userTable).filter(user => user.name.toLowerCase() == name)[0].id
}

function parseSplitCommand(requester, args) {

    const possibleUsers = ['marko', 'hiro', 'seung-jin']
    
    args = args.map(name => (name == 'luke' || name == 'Luke') ? 'seung-jin' : name)

    const splitWith = args.slice(2).map(name => name.toLowerCase())

    // must have 4 or 5 arguments to be valid
    if (args.length < 3 || args.length > 4) {
        throw Error('⚠️ Must have between 4 and 5 arguments: ex. "!split 30 hiro luke"')
    }

    let expense_amount = args[1];

    const regex = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;

    if (!regex.test(expense_amount)) {
        // number is invalid
        throw Error('⚠️ Please provide amount in CAD as second argument (max 2 decimals)')
    }

    splitWith.forEach(person => {
        if (!possibleUsers.includes(person)) {
            throw Error('⚠️ The people you split with must be members of the group - possible values: [hiro, marko, luke]')
        }
    })

    if (splitWith.includes(requester.name.toLowerCase())) {
        throw Error('⚠️ Your name cannot be in the list of people to split with')
    }

    return {
        requester: requester,
        expense: Number(expense_amount),
        splitWith: splitWith
    }
}

function lookup(discordUsername) {
    return userTable[discordUsername]
}

client.login(process.env.TOKEN);