require('dotenv').config()
const axios = require('axios');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

async function main() {
        let moznosti_mineraly = (await axios.get('https://nodejs-3260.rostiapp.cz/tahaky/mineraly')).data;
        
        const commands = [
                new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
                new SlashCommandBuilder().setName('hadanicisla').setDescription('Nové hádání čísla')
                        .addIntegerOption(option =>
                                option.setName("min")
                                        .setDescription("Minimum")
                                        .setRequired(false)
                        )
                        .addIntegerOption(option =>
                                option.setName("max")
                                        .setDescription("Maximum")
                                        .setRequired(false)
                        ),
                new SlashCommandBuilder().setName('hadejcislo').setDescription('Hádání čísla')
                        .addStringOption(option =>
                                option.setName("porovnani")
                                        .setDescription("Porovnání")
                                        .setRequired(true)
                                        .addChoice("číslo je rovno", "=")
                                        .addChoice("číslo je větší než", ">")
                                        .addChoice("číslo je menší než", "<")
                        )
                        .addIntegerOption(option =>
                                option.setName("cislo")
                                        .setDescription("Číslo k porovnání")
                                        .setRequired(true)
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