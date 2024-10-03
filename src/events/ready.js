const { Events  } = require('discord.js');
const logger = require('../utils/logger/logger.js');
const { initializeDatabase, getGuildData } = require('../database/db.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {

		await initializeDatabase();
		client.emit('reloadRPC', client);
		logger.sendStartMessage(client);
		const api = require('../api/api.js');	
	},
};