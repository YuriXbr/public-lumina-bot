const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuildData, addMute, updateMute } = require('../../database/db');

module.exports = {
    permission: 'default',
    category: 'moderation',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to mute.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the mute.'))
        .addStringOption(option => option.setName('time').setDescription('The time for the mute.')),
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const target = interaction.guild.members.cache.get(user.id);
        const author = interaction.user.id;
        const staff = interaction.guild.members.cache.get(author);

        const time = interaction.options.getString('time');
        const timeRegex = /(\d+)([dhms])/;
        const timeMatch = time ? time.match(timeRegex) : null;

        // Fetch the guild data from the database
        let guildData = await getGuildData(interaction.guild.id);
        if (!guildData || !guildData.muteRoleId) {
            return promptSetup(interaction);
        }

        const mutedRoleId = guildData.muteRoleId;
        const mutedRole = interaction.guild.roles.cache.get(mutedRoleId);

        if (!hasPermission(staff)) {
            return interaction.editReply({ content: 'You do not have permission to do that.', ephemeral: true });
        }

        if (!mutedRole) {
            return interaction.editReply({ content: 'The muted role does not exist. Please set a valid muted role in the database.', ephemeral: true });
        }

        if (target.roles.cache.has(mutedRole.id)) {
            return interaction.editReply({ content: 'This user is already muted.', ephemeral: true });
        }

        const muteEndDate = calculateMuteEndDate(timeMatch);

        await muteUser(interaction, target, mutedRole, user, reason, muteEndDate, time);

        sendStaffNotification(interaction, user, reason, time);
        if (guildData.announcementChannelId) sendAnnouncement(interaction, user, reason, time, guildData.announcementChannelId);

        if (muteEndDate) {
            scheduleUnmute(interaction.guild, user.id, mutedRole, muteEndDate);
        }
    }
};

async function promptSetup(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Configuração Necessária')
        .setDescription('O servidor não está configurado. Por favor, execute o comando /setuproles para configurar.')
        .setColor('Red');

    await interaction.editReply({ embeds: [embed], ephemeral: true });
}

function hasPermission(staff) {
    return staff.permissions.has(PermissionsBitField.Flags.MuteMembers) || staff.permissions.has(PermissionsBitField.Flags.Administrator);
}

function calculateMuteEndDate(timeMatch) {
    if (!timeMatch) return null;

    const muteTime = parseInt(timeMatch[1]);
    const muteUnit = timeMatch[2];
    let muteDuration;

    switch (muteUnit) {
        case 'd':
            muteDuration = muteTime * 24 * 60 * 60 * 1000;
            break;
        case 'h':
            muteDuration = muteTime * 60 * 60 * 1000;
            break;
        case 'm':
            muteDuration = muteTime * 60 * 1000;
            break;
        case 's':
            muteDuration = muteTime * 1000;
            break;
        default:
            muteDuration = 0;
    }

    return Date.now() + muteDuration;
}

async function muteUser(interaction, target, mutedRole, user, reason, muteEndDate, time) {
    try {
        await target.roles.add(mutedRole);
    } catch (err) {
        return interaction.editReply({ content: `Eu não tenho permissão para adicionar cargos ao usuário, punição não aplicada`, ephemeral: true });
    }

    await addMute(interaction.guild.id, user.id, interaction.user.id, reason, muteEndDate);
    await interaction.editReply({ content: `Successfully muted ${user.tag} with reason: ${reason} ${time ? `for: ${time}` : 'permanently'}.`, ephemeral: false });
}

async function sendStaffNotification(interaction, user, reason, time) {
    const embed = new EmbedBuilder()
        .setTitle('Mute Applied')
        .setDescription(`You have successfully muted ${user.tag}.`)
        .addFields(
            { name: 'Reason', value: reason, inline: true },
            { name: 'Duration', value: time ? time : 'Permanent', inline: true }
        )
        .setColor('Green');

    await interaction.followUp({ embeds: [embed], ephemeral: true });
}

async function sendAnnouncement(interaction, user, reason, time, announcementChannelId) {
    const announcementChannel = interaction.guild.channels.cache.get(announcementChannelId);
    if (!announcementChannel) return;

    const embed = new EmbedBuilder()
        .setTitle('User Muted')
        .setDescription(`${user.tag} has been muted.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Reason', value: reason, inline: true },
            { name: 'Duration', value: time ? time : 'Permanent', inline: true },
            { name: 'Muted By', value: interaction.user.tag, inline: true }
        )
        .setColor('Red');

    await announcementChannel.send({ embeds: [embed] });
}

function scheduleUnmute(guild, userId, mutedRole, muteEndDate) {
    setTimeout(async () => {
        const updatedGuildData = await getGuildData(guild.id);
        try {
            if (updatedGuildData) {
                const member = guild.members.cache.get(userId);
                if (member) {
                    await member.roles.remove(mutedRole);
                    await updateMute(guild.id, userId, { endTime: new Date() });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, muteEndDate - Date.now());
}