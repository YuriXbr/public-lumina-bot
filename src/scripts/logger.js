const { createReadyEmbed } = require('../utils/embeds/readyEmbed.js');
const colorCodes = require('../utils/colorCodes.js');
const config = require('../private/config.json');
const publicIp = require( 'public-ip' );
const generatedPassword = require('../api/auth.js').generatedPassword;
let client = null;

const mainGuild = config.guilds.logs.guild;
const startChannel = config.guilds.logs.startChannel;
const errorChannel = config.guilds.logs.errorChannel;
const debugChannel = config.guilds.logs.debugChannel;
const dashboardChannel = config.guilds.logs.dashboardChannel;
const staffChannel = config.guilds.logs.staffChannel;
const allChannel = config.guilds.logs.allChannel;


async function sendStartMessage(receivedClient) {
    client = receivedClient;
    const guild = client.guilds.cache.get(mainGuild);
    const channel = guild.channels.cache.get(startChannel || allChannel);
    await channel.send({ embeds: [await createReadyEmbed()] });

    console.log(colorCodes.arrow + colorCodes.verdebold(`BOT FOI INICIADO ${client.user.tag} (ID: ${client.user.id})`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`GUILD: ${guild.name} (ID: ${guild.id})`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`DATA DE CONEXÃO: ${new Date().toLocaleString()}`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`SENHA DO DASHBOARD: ${generatedPassword}`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`API listening at http://${process.env.IP || 'localhost'}:${process.env.PORT || 3000}`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`EXTERNAL DASHBOAD IP: http://${await publicIp.v4() }:${process.env.PORT || 3000}`));
    dashboardLog(`USUÁRIO DO DASHBOARD: ${config.dashBoard.auth.username} SENHA DO DASHBOARD: ${generatedPassword}`, false, true);
}

async function sendErrorMessages(error) {
    const guild = client.guilds.cache.get(mainGuild);
    const channel = guild.channels.cache.get(errorChannel || allChannel);
    console.log(colorCodes.arrow + colorCodes.vermelhobold(`ERRO: ${error}`));
    channel.send(`ERRO: ${error}`);
}

async function noPermission(command, interaction) {
    const embed = {
        title: 'Sem permissão',
        description: `Você não tem permissão para usar o comando \`${command.data.name}\`.`
    }
    interaction.reply({ embeds: [embed], ephemeral: true });
}

async function dashboardLog(message, silent, clogSilent) {
    const embed = {
        title: 'Dashboard',
        description: message
    }
    if(!clogSilent) console.log(colorCodes.arrow + colorCodes.alerta(`[DASHBOARD]: ${message}`));
    if (!silent) {
        const guild = client.guilds.cache.get(mainGuild);
        const channel = guild.channels.cache.get(dashboardChannel || allChannel);
        channel.send({ embeds: [embed] });
    }

}

module.exports = {
    sendStartMessage,
    noPermission,
    sendErrorMessages,
    dashboardLog
}