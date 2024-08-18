const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),

	execute(interaction) {
		interaction.reply('Pong!');
	},
};