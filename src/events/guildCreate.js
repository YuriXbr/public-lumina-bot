const { MessageEmbed } = require('discord.js');
const { createGuildData, addBan } = require('../database/db');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild) {
        console.log(`Bot adicionado ao servidor: ${guild.name} (${guild.id}) - ${guild.memberCount} membros`);

        // Create a new guild data entry
        await createGuildData(guild.id, guild.ownerId, guild.name);

        // Fetch the list of banned users and add them to the banRecords
        const bans = await guild.bans.fetch();
        for (const [userId, banInfo] of bans) {
            const staffId = banInfo.executor ? banInfo.executor.id : 'unknown';
            const reason = banInfo.reason ? `${banInfo.reason} (herdado)` : 'Sem motivo (herdado)';
            await addBan(guild.id, userId, staffId, reason, null);
        }
    },
};