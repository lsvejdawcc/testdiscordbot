require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const { Client, Intents } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_BANS] });

// Login to Discord with your client's token
client.login(process.env.token);

let channel

const NUDA_PO_MIN = 5;
let casovacNuda;
const SOUBOR_PRIVITANI_UZIVATELE = "privitani-uzivatele.json"
let privitaniUzivatele = [];
if (fs.existsSync(SOUBOR_PRIVITANI_UZIVATELE)) {
    privitaniUzivatele = JSON.parse(fs.readFileSync(SOUBOR_PRIVITANI_UZIVATELE));
}

// When the client is ready, run this code (only once)
client.once('ready', client => {
    console.log(client);
    channel = client.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(client.user).has('SEND_MESSAGES'))
    channel.send("Čágo! :smiley: **Je tu někdo?**") // *kurziva* / **tucne** / __podtrzene__ / ``kod``
    casovacNuda = setInterval(jeTuNuda, NUDA_PO_MIN*60000);
    //console.log(`Ready! Logged in as ${client.user.tag}`);
});

// client.on('guildCreate', guild => {
//     const channel = guild.channels.cache.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'))
//     channel.send("Thanks for invite me")
// })

client.on("messageCreate", async message => {
    console.log(message);

    clearInterval(casovacNuda);
    casovacNuda = setInterval(jeTuNuda, NUDA_PO_MIN*60000);

    if (message.content.includes("debil")) {
		message.react('😡🦿'); //https://unicode.org/emoji/charts/full-emoji-list.html
        
        let a = await message.guild.members.fetch(message.author.id)
        // https://discord.js.org/#/docs/main/stable/class/GuildMember?scrollTo=kick
        a.kick('Používá urážky!').then(mem => {message.channel.send(`Kopanec pro ${mem.user.username}!!!`)});

    } else if (message.content.includes("prdel")) {
        message.react('😡🛑');
        
        let a = await message.guild.members.fetch(message.author.id)
        // https://discord.js.org/#/docs/main/stable/class/GuildMember?scrollTo=ban
        a.ban({days: 1, reason: 'Je to sprosťák!',}).then(mem => {message.channel.send(`Jednodenní ban pro ${mem.user.username}!!!`)});

    } else if (message.content.includes("bordel")) {
		message.react('😡');
        
        let a = await message.guild.members.fetch(message.author.id)
        // https://discord.js.org/#/docs/main/stable/class/GuildMember?scrollTo=timeout
        a.timeout(1 * 60000, 'Je to rebel!').then(mem => {message.channel.send(`${mem.user.username} má vynucenou pauzičku!`)});

    } else if (message.author.id != client.user.id && !privitaniUzivatele.includes(message.author.id)) {
        privitaniUzivatele.push(message.author.id);
        fs.writeFileSync(SOUBOR_PRIVITANI_UZIVATELE, JSON.stringify(privitaniUzivatele));
        message.reply({ content: 'Ahoooj! 😀 ...tebe jsem tu ještě neviděl.', fetchReply: true });
    }

});

function jeTuNuda() {
    channel.send("Nuuudaaa 🥱")
}

//commandy je treba pridat do deploy-commands.js a zaregistrovat zavolanim "node deploy-commands.js"
let idHadani;
client.on('interactionCreate', async interaction => {
    console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping2') {
		await interaction.reply('Pong2!');
	} else if (commandName === 'hadejcislo') {
        let volba = interaction.options.get("volba");
        if (volba) {
            volba = volba.value.trim();
        }
        console.log(volba)

        let zprava;
        if (volba && !idHadani) {
            zprava = "** ❗Nejprve zavolej inicializaci hádání bez zadané volby❗ **"
        } else if (volba) {
            let porovnani = "rovno";
            if (volba[0] == "<") {
                porovnani = "mensi";
            } else if (volba[0] == ">") {
                porovnani = "vetsi";
            }
            let cislo = volba.substr(1);
            const response = await axios.get('https://nodejs-3260.rostiapp.cz/hadejcislo/odhad?id='+idHadani+"&cislo="+cislo+"&porovnani="+porovnani);
            zprava = response.data.zprava
            if (response.data.vysledek && porovnani == "rovno") {
                zprava = "**" + zprava + "** 👍"
            }
        } else {
            const response = await axios.get('https://nodejs-3260.rostiapp.cz/hadejcislo/noveHadani?min=1&max=10');
            idHadani = response.data.id;
            zprava = response.data.zprava
            zprava = "**" + zprava + "**"
        }
        await interaction.reply(zprava);
	} else if (commandName === 'mineraly') {
        let mineral = interaction.options.get("mineral").value;
        const response = await axios.get(encodeURI('https://nodejs-3260.rostiapp.cz/tahaky/mineraly?mineral='+mineral));
        let zprava = ""; //JSON.stringify(response.data)
        for (let k of Object.keys(response.data)) {
            if (k == "status") continue;
            zprava += `**${k}**: ${response.data[k]}\n`
        }
        await interaction.reply(zprava);
	}
});
