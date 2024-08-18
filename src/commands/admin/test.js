const { SlashCommandBuilder } = require('discord.js');
const riotApi = require('../../api/riotApi.js');

module.exports = {
    permission: 'admin',
    category: 'admin',
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command for the bot.'),


    async execute(interaction) {
        const accountInfo = await riotApi.getAccountByRiotId("americas","CADE A PIX", "EMI");
        if(accountInfo === undefined) {
            interaction.reply({content: 'There was an error getting the summoner information.', ephemeral: true});
        } else {
            console.log({accountInfo});
            interaction.reply({content: `Summoner name: ${accountInfo.name}`, ephemeral: true});
        }
    },
};