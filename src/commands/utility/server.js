const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),

	execute(interaction) {

		const embed = new EmbedBuilder()
			.setTitle(`Server Information - ${interaction.guild.name}`)
			.setColor('Aqua')
			.setThumbnail(interaction.guild.iconURL())
			.addFields(
				{ name: 'Server Name', value: interaction.guild.name, inline: true },
				{ name: 'Server ID', value: interaction.guild.id, inline: true },
				{ name: 'Created At', value: interaction.guild.createdAt.toDateString(), inline: true },
				{ name: 'Member Count', value: interaction.guild.memberCount, inline: true }
			);

			interaction.reply({ embeds: [embed] });
	},

};