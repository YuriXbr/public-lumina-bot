const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuildData, addBan, updateBan } = require('../../database/db');

module.exports = {
    permission: 'default',
    category: 'moderation',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to ban.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the ban.'))
        .addStringOption(option => option.setName('time').setDescription('The time for the ban.')),
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
        if (!guildData) {
            return promptSetup(interaction);
        }

        if (!hasPermission(staff)) {
            return interaction.editReply({ content: 'You do not have permission to do that.', ephemeral: true });
        }

        if (target.bannable === false) {
            return interaction.editReply({ content: 'I cannot ban this user.', ephemeral: true });
        }

        const banEndDate = calculateBanEndDate(timeMatch);

        await banUser(interaction, target, user, reason, banEndDate, time);

        sendStaffNotification(interaction, user, reason, time);
        if (guildData.announcementChannelId) sendAnnouncement(interaction, user, reason, time, guildData.announcementChannelId);

        if (banEndDate) {
            scheduleUnban(interaction.guild, user.id, banEndDate);
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
    return staff.permissions.has(PermissionsBitField.Flags.BanMembers) || staff.permissions.has(PermissionsBitField.Flags.Administrator);
}

function calculateBanEndDate(timeMatch) {
    if (!timeMatch) return null;

    const banTime = parseInt(timeMatch[1]);
    const banUnit = timeMatch[2];
    let banDuration;

    switch (banUnit) {
        case 'd':
            banDuration = banTime * 24 * 60 * 60 * 1000;
            break;
        case 'h':
            banDuration = banTime * 60 * 60 * 1000;
            break;
        case 'm':
            banDuration = banTime * 60 * 1000;
            break;
        case 's':
            banDuration = banTime * 1000;
            break;
        default:
            banDuration = 0;
    }

    return Date.now() + banDuration;
}

async function banUser(interaction, target, user, reason, banEndDate, time) {
    try {
        await target.ban({ reason });
    } catch (err) {
        return interaction.editReply({ content: `Eu não tenho permissão para banir o usuário, punição não aplicada`, ephemeral: true });
    }

    await addBan(interaction.guild.id, user.id, interaction.user.id, reason, banEndDate);
    await interaction.editReply({ content: `Successfully banned ${user.tag} with reason: ${reason} ${time ? `for: ${time}` : 'permanently'}.`, ephemeral: false });
}

async function sendStaffNotification(interaction, user, reason, time) {
    const embed = new EmbedBuilder()
        .setTitle('Ban Applied')
        .setDescription(`You have successfully banned ${user.tag}.`)
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
        .setTitle('User Banned')
        .setDescription(`${user.tag} has been banned.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Reason', value: reason, inline: true },
            { name: 'Duration', value: time ? time : 'Permanent', inline: true },
            { name: 'Banned By', value: interaction.user.tag, inline: true }
        )
        .setColor('Red');

    await announcementChannel.send({ embeds: [embed] });
}

function scheduleUnban(guild, userId, banEndDate) {
    setTimeout(async () => {
        const updatedGuildData = await getGuildData(guild.id);
        try {
            if (updatedGuildData) {
                await guild.members.unban(userId);
                await updateBan(guild.id, userId, { endTime: new Date() });
            }
        } catch (error) {
            console.error(error);
        }
    }, banEndDate - Date.now());
}