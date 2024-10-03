const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuildData, removeWarn } = require('../../database/db');

module.exports = {
    permission: 'default',
    category: 'moderation',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove a warn from a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to unwarn.').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const author = interaction.user.id;
        const staff = interaction.guild.members.cache.get(author);

        // Fetch the guild data from the database
        let guildData = await getGuildData(interaction.guild.id);
        if (!guildData) {
            return promptSetup(interaction);
        }

        if (!hasPermission(staff)) {
            return interaction.editReply({ content: 'You do not have permission to do that.', ephemeral: true });
        }

        // Remove the warn record from the database
        await removeWarn(interaction.guild.id, user.id);

        const embed = new EmbedBuilder()
            .setTitle('User Unwarned')
            .setDescription(`${user.tag} has been unwarned.`)
            .setColor('Green');

        await interaction.editReply({ embeds: [embed], ephemeral: true });
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
    return staff.permissions.has(PermissionsBitField.Flags.KickMembers) || staff.permissions.has(PermissionsBitField.Flags.Administrator);
}