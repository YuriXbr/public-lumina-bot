const { Events } = require('discord.js');
const config = require('../private/config.json');
const { noPermission, dashboardLog, eventLogEmbed, commandErrorWarning } = require('../utils/logger/logger.js');
const { ActivityType } = require('discord.js');

const staffOwners = config.staff.owners;
const staffAdmins = config.staff.admins.concat(staffOwners);
const staffModerators = config.staff.moderators.concat(staffAdmins);

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		const { client } = interaction;
		
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			commandErrorWarning(interaction, 'No command matching the name was found.', 'No command matching the name was found.');
			return;
		}

        client.user.setActivity({
            name: config.bot.activity.name,
            type: ActivityType[config.bot.activity.type],
        });


		if (!staffOwners.includes(interaction.user.id) && command.permission == 'owner') return noPermission(command, interaction, 'InteractionCreate');
		if (!staffAdmins.includes(interaction.user.id) && (command.permission == 'admin' )) return noPermission(command, interaction, 'InteractionCreate');
		if (!staffModerators.includes(interaction.user.id) && command.permission == 'moderator') return noPermission(command, interaction, 'InteractionCreate');

		

		try {
			let buffer = interaction;
			await command.execute(interaction);
			eventLogEmbed(buffer, 'InteractionCreate', `Command ${interaction.commandName} was executed by ${interaction.user.tag} in ${interaction.guild.name} in ${interaction.lang}.`);
			buffer = null;
		} catch (error) {
			await commandErrorWarning(interaction, error, 'An error occurred while executing the command.');
		}
	},
};