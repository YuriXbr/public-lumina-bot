const { Events  } = require('discord.js');
const logger = require('../scripts/logger.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {

		
		client.emit('reloadRPC', client);
		logger.sendStartMessage(client);
		const api = require('../api/api.js');	
	},
};