const { SlashCommandBuilder } = require('discord.js');
const config = require('../../private/config.json');
const password = require('../../api/auth.js').generatedPassword;
const { dashboardLog } = require('../../utils/logger/logger.js');

module.exports = {
    permission: 'admin',
    category: 'staff',
    cooldown: 15,
	data: new SlashCommandBuilder()
		.setName('dashboard')
		.setDescription('Reply with the dashboard credentials.'),

	execute(interaction) {
			const client = interaction.client;
			dashboardLog(client, `Password requested by ${interaction.user.tag} (ID: ${interaction.user.id})`, false);
            interaction.reply({content: `Dashboard username: ${config.dashBoard.auth.username} \n Dashboard Password: ${password}`, ephemeral: true});
            
	},
};