const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../../api/riotApi.js');

module.exports = {
    permission: 'default',
    category: 'league',
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('leagueprofile')
        .setDescription('Shows the profile of a League of Legends player.')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('The server of the player.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('server')
                .setDescription('The server of the player.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('summonername')
                .setDescription('The summoner name of the player.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('tagline')
                .setDescription('The tagline of the player.')
                .setRequired(true)
        ),


    async execute(interaction) {
        const region = interaction.options.getString('region');
        const server = interaction.options.getString('server');
        const summonerName = interaction.options.getString('summonername');
        const tagLine = interaction.options.getString('tagline');
        interaction.deferReply("Fetching data...");

        const accountInfo = await api.getAccountByRiotId(region, summonerName, tagLine);
        console.log(accountInfo);
        const summonerInfo = await api.getSummonerInfo(server, accountInfo.puuid);
        console.log(summonerInfo);
        const queueInfo = await api.getLeagueEntries(server, summonerInfo.id);
        console.log(queueInfo);
        const masteryInfo = await api.getChampionMastery(server, summonerInfo.puuid);
        //console.log(masteryInfo);
        const topMastery = masteryInfo.sort((a, b) => b.championPoints - a.championPoints)[0];
        console.log("TOP MAESTRIA ");
        console.log({topMastery});
        const topMasteryChampion = await api.fetchChampionName(topMastery.championId);
        console.log(topMasteryChampion);
        const ddragonVersion = await api.getDDragonLatestVersion();

        const champFullImage = `http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${topMasteryChampion.fullImage}`;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Summoner name: ${accountInfo.gameName}#${accountInfo.tagLine}`)
            .setDescription(`Level: ${summonerInfo.summonerLevel}`)
            .setTimestamp()
            .setFooter({text: 'Powered by Riot Games API', iconURL: 'https://i.imgur.com/xU45ZZz.png'})
            .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${summonerInfo.profileIconId}.png`)
            .setImage(champFullImage)
            .addFields(queueInfo
                .filter(queue => queue.queueType !== 'CHERRY') // Filtra a fila "CHERRY"
                .map(queue => {
                    return {
                        name: queue.queueType,
                        value: `Rank: ${queue.tier} ${queue.rank} ${queue.leaguePoints} LP\nWins: ${queue.wins}\nLosses: ${queue.losses}\nWinrate: ${((queue.wins / (queue.wins + queue.losses)) * 100).toFixed(2)}%`,
                        inline: true,
                    };
                })
            );

        interaction.editReply({embeds: [embed]});
    },
};