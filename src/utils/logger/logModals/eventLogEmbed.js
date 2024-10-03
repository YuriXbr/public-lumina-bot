const config = require('../../../private/config.json');

const mainGuild = config.guilds.logs.guild;
const eventsChannel = config.guilds.logs.eventsChannel;
const allChannel = config.guilds.logs.allChannel;

    /** This function is used to log events in the events channel
     * @param {object} interaction - The interaction object
     * @param {string} eventCaller - The name of the event
     * @param {string} message - The message that will be displayed in the embed
     */
function eventLogEmbed(interaction, eventCaller, message) {
    const embed = {
        title: `Evento ${eventCaller}`,
        description: message
    }
    const client = interaction.client;
    const guild = client.guilds.cache.get(mainGuild);
    const channel = guild.channels.cache.get(eventsChannel || allChannel);
    channel.send({ embeds: [embed] });
}

module.exports = {
    eventLogEmbed,
};