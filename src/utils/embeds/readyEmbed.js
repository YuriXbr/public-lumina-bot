const Discord = require('discord.js');
var today = new Date(); var data = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
const c = require('../colorCodes.js');
const cache = require('../../private/cache.json');
const password = cache.cache.data.generatedPassword;
const publicIp = require( 'public-ip' );

let ip = 'localhost';

async function getExternalIp() {
	if(process.env.IP) return ip = await publicIp.v4()
}

const port = process.env.PORT || 3000;

/** Create Ready Embed
 * @returns {MessageEmbed} - Returns a ready embed
 */
async function createReadyEmbed() {
    const externalIp = await getExternalIp();
    const readyEmbed = new Discord.EmbedBuilder()
        .setColor(c.GREEN)
        .setTitle('✅ | CONEXÃO ESTABELECIDA')
        .setDescription("BOT FOI INICIADO")
        .addFields([
            {name: 'DATA DE CONEXÃO', value: `${data}`},
            {name: 'IP DO DASHDBOARD', value: `http://${ip}:${port}`},
            {name: 'IP EXTERNO DO DASHBOARD', value: `http://${externalIp}:${port}`},
            {name: 'SENHA DO DASHBOARD', value: `||${password}||`}
        ]);
    return readyEmbed;
}


module.exports = {
	createReadyEmbed
}