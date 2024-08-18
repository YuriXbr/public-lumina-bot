const { ActivityType } = require('discord.js');

module.exports = {
	name: 'reloadRPC',
	execute(client) {
		delete require.cache[require.resolve('../private/config.json')];
        const config = require('../private/config.json');

		 client.user.setActivity({
		 	name: config.bot.activity.name,
		 	type: ActivityType[config.bot.activity.type],
		});

		//console.log('RPC reloaded. Activity:', config.bot.activity.name);
	},
};