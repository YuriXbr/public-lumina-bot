const colorCodes = require('../../colorCodes.js');
const config = require('../../../private/config.json');
//let client = null;

const mainGuild = config.guilds.logs.guild;
const errorChannel = config.guilds.logs.startChannel;
const allChannel = config.guilds.logs.allChannel;

/** Send Error Messages
 * @param {string} error - The error message
 */
async function sendErrorMessages(error, client) {
    const guild = client.guilds.cache.get(mainGuild);
    const channel = guild.channels.cache.get(errorChannel || allChannel);
    console.log(colorCodes.arrow + colorCodes.vermelhobold(`ERRO: ${error}`));
    channel.send(`ERRO: ${error}`);
}

module.exports = {
    sendErrorMessages
};