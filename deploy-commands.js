require('dotenv').config()
const axios = require('axios');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

async function main() {
        let moznosti_mineraly = (await axios.get('https://nodejs-3260.rostiapp.cz/tahaky/mineraly')).data;
        
        const commands = [
                new SlashCommandBuilder().setName('ping2').setDescription('Replies with pong!'),
                new SlashCommandBuilder().setName('hadejcislo').setDescription('Hadani cisla')
                        .addStringOption(option =>
                                option.setName("volba")
                                        .setDescription("Výběr z možností")
                                        .setRequired(false)
                        ),
                new SlashCommandBuilder().setName('mineraly').setDescription('Tahak - mineraly')
                        .addStringOption(option => {
                                option.setName("mineral")
                                        .setDescription("Zadej minerál")
                                        .setRequired(true)
                                for (let m of moznosti_mineraly) {
                                        option.addChoice(m, m)
                                }
                                return option
                        }),
        
        ].map(command => command.toJSON());
        
        const rest = new REST({ version: '9' }).setToken(process.env.token);
        
        rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands })
                .then(() => console.log('Successfully registered application commands.'))
                .catch(console.error);
}

main()