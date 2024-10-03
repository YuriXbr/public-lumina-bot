const publicIp = require( 'public-ip' );
const { createReadyEmbed } = require('../../embeds/readyEmbed.js');
const {dashboardLog} = require('./dashboardLog.js');

const config = require('../../../private/config.json');
const cache = require('../../../private/cache.json');
const username = cache.cache.data.username;

const colorCodes = require('../../colorCodes.js');


let client = null;

const mainGuild = config.guilds.logs.guild;
const startChannel = config.guilds.logs.startChannel;
const allChannel = config.guilds.logs.allChannel;

/** Send Start Message
 * @param {object} receivedClient - The client object
 */
async function sendStartMessage(receivedClient) {
    client = receivedClient;
    const { setPassword } = require('../../../api/auth.js');
    const password = await setPassword();
    const guild = client.guilds.cache.get(mainGuild);
    const channel = guild.channels.cache.get(startChannel || allChannel);
    await channel.send({ embeds: [await createReadyEmbed()] });

    console.log(colorCodes.arrow + colorCodes.verdebold(`BOT FOI INICIADO ${client.user.tag} (ID: ${client.user.id})`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`GUILD: ${guild.name} (ID: ${guild.id})`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`DATA DE CONEXÃO: ${new Date().toLocaleString()}`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`SENHA DO DASHBOARD: ${password}`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`API listening at http://${process.env.IP || 'localhost'}:${process.env.PORT || 3000}`));
    console.log(colorCodes.arrow + colorCodes.verdebold(`EXTERNAL DASHBOAD IP: http://${await publicIp.v4() }:${process.env.PORT || 3000}`));
    dashboardLog(client,`USUÁRIO DO DASHBOARD: ${username} SENHA DO DASHBOARD: ${password}`, false, true);
}

module.exports = {
    sendStartMessage,
    client
};

