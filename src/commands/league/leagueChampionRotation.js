const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../api/riotApi.js');

module.exports = {
    permission: 'default',
    category: 'league',
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('leaguechampionrotation')
        .setDescription('Shows the champions currently in rotation.'),

    async execute(interaction) {
        interaction.deferReply("Fetching data...");

        const rotationChampionsId = await api.getChampionRotation();
        const rotationChampions = await Promise.all(rotationChampionsId.map(async (id) => {
            return await api.fetchChampionName(id);
        }));
        console.log([rotationChampions]);

        // Create an embed to display the champions in rotation
        const embed = new EmbedBuilder()
            .setTitle('Champions in Rotation')
            .setDescription('Here are the champions currently in rotation:')
            .setColor('#0099ff')
            .setFooter({text: 'Powered by Riot Games API', iconURL: 'https://i.imgur.com/xU45ZZz.png'})
            .addFields(rotationChampions
                .filter(champion => champion !== null) // Filtra campeões que não foram encontrados
                .map(champion => {
                    return { name: champion.id, value: `${champion.title}`,"inline": true };
                })
            );

        interaction.editReply({ embeds: [embed] });
    },
};