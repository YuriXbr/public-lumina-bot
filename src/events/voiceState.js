const { Events } = require('discord.js');
const config = require('../private/config.json');
const { PermissionsBitField } = require('discord.js');

const guildId = config.guilds.callTimer.notificationGuild; // guild id
const notificationChannelId = config.guilds.callTimer.notificationChannel; // channel id
const callTimerEnabled = config.guilds.callTimer.enabled; // Verify if the module is enabled

let callStartTimes = {}; // Store call start times for each pair of users
let inVoiceChannels = {}; // Store voice channel status for each pair of users

module.exports = {
	name: Events.VoiceStateUpdate,
	execute(oldState, newState) {
		const guild = newState.guild; // Obter a guilda do novo estado

		if (!callTimerEnabled) return; // Verify if the module is enabled
		
		if (guild.id !== guildId) return; // Garantir que estamos na guilda certa

		const channel = guild.channels.cache.get(notificationChannelId);
        if (!channel) {
            console.log(`Canal com ID ${notificationChannelId} não encontrado`);
            return;
        }

        const users = config.guilds.callTimer.users;
        const userIds = Object.values(users);

        for (let i = 0; i < userIds.length; i++) {
            for (let j = i + 1; j < userIds.length; j++) {
                const user1Id = userIds[i];
                const user2Id = userIds[j];

                const user1VoiceState = guild.voiceStates.cache.get(user1Id);
                const user2VoiceState = guild.voiceStates.cache.get(user2Id);

                const user1InChannel = user1VoiceState && user1VoiceState.channel;
                const user2InChannel = user2VoiceState && user2VoiceState.channel;

                const pairKey = `${user1Id}-${user2Id}`;

                // Verify if both users are in the same voice channel
                if (user1InChannel && user2InChannel && user1VoiceState.channel.id === user2VoiceState.channel.id) {
                    if (!inVoiceChannels[pairKey]) {
                        inVoiceChannels[pairKey] = true;
                        callStartTimes[pairKey] = new Date();
                        channel.send(`<@${user1Id}> e <@${user2Id}> estão no mesmo canal de voz ${user1VoiceState.channel.name}`);
                    }
                } else {
                    if (inVoiceChannels[pairKey]) {
                        inVoiceChannels[pairKey] = false;
                        const callEndTime = new Date();
                        const callDuration = (callEndTime - callStartTimes[pairKey]) / 1000; // seconds
                        const minutes = Math.floor(callDuration / 60);
                        const seconds = Math.floor(callDuration % 60);
                        channel.send(`<@${user1Id}> e <@${user2Id}> ficaram em call por ${minutes} minutos e ${seconds} segundos.`);
                        callStartTimes[pairKey] = null;
                    }
                }
            }
        }
    },
};