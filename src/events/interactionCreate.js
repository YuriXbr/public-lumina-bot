const { Events } = require('discord.js');
const config = require('../private/config.json');
const { noPermission, dashboardLog } = require('../scripts/logger');

const staffOwners = config.staff.owners;
const staffAdmins = config.staff.admins.concat(staffOwners);
const staffModerators = config.staff.moderators.concat(staffAdmins);

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		const { client } = interaction;
		const { ActivityType } = require('discord.js');

        client.user.setActivity({
            name: config.bot.activity.name,
            type: ActivityType[config.bot.activity.type],
        });


		if (!staffOwners.includes(interaction.user.id) && command.permission == 'owner') return noPermission(command, interaction);
		if (!staffAdmins.includes(interaction.user.id) && (command.permission == 'admin' )) return noPermission(command, interaction);
		if (!staffModerators.includes(interaction.user.id) && command.permission == 'moderator') return noPermission(command, interaction);

		

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};