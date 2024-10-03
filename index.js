console.clear();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Guild, GatewayIntentBits, ActivityType } = require('discord.js');
const config = require('./src/private/config.json');
const c = require('./src/utils/colorCodes.js');

const client = new Client({
	 intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			 console.log(c.arrow + c.verdebold(`[SUCCESS] Command ${command.data.name} loaded`));
		} else {
			 console.log(c.arrow + c.alerta(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`));
		}
	}
}

const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	 console.log(c.arrow + c.verdebold(`[SUCCESS] Event ${event.name} loaded`));
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const configPath = path.join(__dirname, 'src', 'private', 'config.json');
fs.watchFile(configPath, { persistent: true, interval: 500 }, () => {
	client.emit('reloadRPC', client);
});

// Log in to Discord with your client's token
client.login(config.bot.token);

module.exports = { client };