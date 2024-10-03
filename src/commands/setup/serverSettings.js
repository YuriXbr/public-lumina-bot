// Settings commands, list all settings and add buttons to restore default settings and modify each setting.

const { SlashCommandBuilder, ButtonStyle } = require('discord.js');
const { getGuildData, updateGuildData } = require('../../database/db.js');

module.exports = {
    permission: 'default',
    category: 'setup',
    data: new SlashCommandBuilder()
        .setName('serversettings')
        .setDescription('View and modify server settings.'),
    async execute(interaction) {
        await interaction.deferReply();

        const guildData = await getGuildData(interaction.guild.id);
        const settings = guildData.settings;

        const settingsEmbed = {
            color: 'BLUE',
            title: 'Server Settings',
            fields: []
        };

        for (const setting in settings) {
            settingsEmbed.fields.push({
                name: setting,
                value: settings[setting],
                inline: true
            });
        }

        const row = {
            type: 'ACTION_ROW',
            components: [
                {
                    type: 'BUTTON',
                    style: ButtonStyle.PRIMARY,
                    label: 'Restore Default Settings',
                    customId: 'restore_default_settings'
                }
            ]
        };

        await interaction.editReply({ embeds: [settingsEmbed], components: [row] });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'restore_default_settings') {
                const defaultSettings = {
                    setting1: 'value1',
                    setting2: 'value2',
                    setting3: 'value3'
                };

                await updateGuildData(interaction.guild.id, { settings: defaultSettings });

                const updatedEmbed = {
                    color: 'GREEN',
                    title: 'Server Settings',
                    description: 'Default settings have been restored.'
                };

                await i.update({ embeds: [updatedEmbed], components: [] });
            }

            if (i.customId === 'setting1') {
                // Modify setting1
            }

            if (i.customId === 'setting2') {
                // Modify setting2
            }

            if (i.customId === 'setting3') {
                // Modify setting3
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ content: 'The settings menu has expired.', components: [] });
        });


    }
};