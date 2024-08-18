const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./src/private/config.json');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.bot.token);

// and deploy your commands!
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const deployGuilds = config.guilds.deployGuilds;

        for (const guildId of deployGuilds) {
            await rest.put(
                Routes.applicationGuildCommands(config.bot.clientId, guildId),
                { body: commands },
            );
            console.log(`Successfully reloaded application (/) commands for guild ${guildId}.`);
        }

        console.log('Successfully reloaded application (/) commands for all guilds.');
    } catch (error) {
        console.error(error);
    }
})();