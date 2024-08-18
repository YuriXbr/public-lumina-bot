const api = require('../../api/riotApi.js');
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateMatchChart } = require('../../scripts/chartGenerator');

module.exports = {
    permission: 'default',
    category: 'league',
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('leaguematchhistory')
        .setDescription('Shows the match history of a League of Legends player.')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('The region of the player.')
                .setRequired(true)
                .addChoices(
                    { name: 'AMERICAS', value: 'americas'},
                    { name: 'EUROPE', value: 'europe'},
                    { name: 'ASIA', value: 'asia'}
                )
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
        )
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The number of matches to show.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const region = interaction.options.getString('region');
        const summonerName = interaction.options.getString('summonername');
        const tagLine = interaction.options.getString('tagline');
        await interaction.deferReply();

        let number = interaction.options.getInteger('number') || 5;
        if (number > 10) number = 10;

        let statusMessage = "<a:loading:1274651043908816969> Acessando informações da conta do usuário\n<a:loading:1274651043908816969> Acessando histórico de partidas\n";
        for (let i = 0; i < number; i++) {
            statusMessage += `<a:loading:1274651043908816969> Analisando estatísticas para partida ${i + 1}\n`;
        }
        await interaction.editReply(statusMessage);

        const accountInfo = await api.getAccountByRiotId(region, summonerName, tagLine);
        if (!accountInfo) {
            statusMessage = statusMessage.replace("<a:loading:1274651043908816969> Acessando informações da conta do usuário", "❌ Falha ao acessar informações da conta do usuário");
            return interaction.editReply(statusMessage);
        }
        statusMessage = statusMessage.replace("<a:loading:1274651043908816969> Acessando informações da conta do usuário", "✅ Acessando informações da conta do usuário");
        await interaction.editReply(statusMessage);

        const matchHistory = await api.getMatchHistory(region, accountInfo.puuid);
        if (!matchHistory) {
            statusMessage = statusMessage.replace("<a:loading:1274651043908816969> Acessando histórico de partidas", "❌ Falha ao acessar histórico de partidas");
            return interaction.editReply(statusMessage);
        }
        statusMessage = statusMessage.replace("<a:loading:1274651043908816969> Acessando histórico de partidas", "✅ Acessando histórico de partidas");
        await interaction.editReply(statusMessage);

        for (let i = 0; i < number; i++) {
            try {
                statusMessage = statusMessage.replace(`<a:loading:1274651043908816969> Analisando estatísticas para partida ${i + 1}`, `<a:loading:1274651043908816969> Analisando estatísticas para partida ${i + 1}\n<a:loading:1274651043908816969> Gerando gráfico`);
                await interaction.editReply(statusMessage);

                const match = matchHistory[i];
                const participant = match.info.participants.find(p => p.puuid === accountInfo.puuid);

                const championData = await api.fetchChampionName(participant.championId);
                const ddragonVersion = await api.getDDragonLatestVersion();
                const win = participant.win;
                const color = win ? '#0099ff' : '#FF0000';

                const chartBuffer = await generateMatchChart(participant);
                const attachment = new AttachmentBuilder(chartBuffer, { name: 'match-stats.png' });

                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`${summonerName}#${tagLine} | Champion: ${championData.name || 'unknown'} | ${win ? 'Victory' : 'Defeat'}`)
                    .setDescription(`Match ${i + 1} - ${match.info.gameMode} / time: ${new Date(match.info.gameStartTimestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`)
                    .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${championData.fullImage || 'https://i.imgur.com/xU45ZZz.png'}`)
                    .setImage('attachment://match-stats.png')
                    .setTimestamp()
                    .addFields([
                        { name: 'Kills', value: participant.kills.toString(), inline: true },
                        { name: 'Deaths', value: participant.deaths.toString(), inline: true },
                        { name: 'Assists', value: participant.assists.toString(), inline: true },
                        { name: 'KDA', value: ((participant.kills + participant.assists) / participant.deaths).toFixed(2).toString(), inline: true },
                        { name: 'Damage Dealt to Champions', value: participant.totalDamageDealtToChampions.toString(), inline: true },
                        { name: 'Damage Taken', value: participant.totalDamageTaken.toString(), inline: true },
                        { name: 'Gold Earned', value: participant.goldEarned.toString(), inline: true },
                        { name: 'Vision Score', value: participant.visionScore.toString(), inline: true },
                        { name: 'Wards Placed', value: participant.wardsPlaced.toString(), inline: true },
                        { name: 'Creep Score', value: participant.totalMinionsKilled.toString(), inline: true },
                        { name: 'Creep Score per Minute', value: (participant.totalMinionsKilled / (match.info.gameDuration / 60)).toFixed(2).toString(), inline: true },
                    ])
                    .setFooter({ text: 'Powered by Riot Games API', iconURL: 'https://i.imgur.com/xU45ZZz.png' });

                await interaction.followUp({ embeds: [embed], files: [attachment] });
                statusMessage = statusMessage.replace(`<a:loading:1274651043908816969> Analisando estatísticas para partida ${i + 1}\n<a:loading:1274651043908816969> Gerando gráfico`, `✅ Analisando estatísticas para partida ${i + 1}\n✅ Gerando gráfico`);
                await interaction.editReply(statusMessage);
            } catch (err) {
                console.error(err);
                statusMessage = statusMessage.replace(`<a:loading:1274651043908816969> Analisando estatísticas para partida ${i + 1}\n<a:loading:1274651043908816969> Gerando gráfico`, `❌ Falha ao analisar estatísticas para partida ${i + 1}`);
                await interaction.followUp(statusMessage);
            }
        }
    },
};