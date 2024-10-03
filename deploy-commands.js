const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./src/private/config.json');
const c = require('./src/utils/colorCodes.js');

const globalCommands = [];
const localCommands = [];
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

console.log(c.arrow + c.alerta('[WARNING] Local commands are only available in deployGuilds. Be sure to add the guilds in the config file.'));
console.log(c.arrow + c.verde('Started refreshing application (/) commands.'));

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            if (folder === 'admin') {
                localCommands.push(command.data.toJSON());
                console.log(c.arrow + c.alerta(`[WARNING] The command ${command.data.name} is admin only.`));
                console.log(c.arrow + c.verdebold(`[SUCCESS] The command ${command.data.name} was added to the LOCAL commands.`));
            } else {
                globalCommands.push(command.data.toJSON());
                console.log(c.arrow + c.verdebold(`[SUCCESS] The command ${command.data.name} was added to the GLOBAL commands.`));
            }
        } else {
            console.log(c.arrow + c.alerta(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`));
        }
    }
}

const rest = new REST().setToken(config.bot.token);

(async () => {
    try {
        console.log(c.arrow + c.verde('Started refreshing application (/) commands.'));

        if (config.bot.devmode) {
            const deployGuilds = config.guilds.deployGuilds;

            for (const guildId of deployGuilds) {
                await rest.put(
                    Routes.applicationGuildCommands(config.bot.clientId, guildId),
                    { body: localCommands },
                );
                console.log(c.arrow + c.verde(`Successfully reloaded application (/) commands for guild ${guildId}.`));
            }
        } else {
            // Deploy new global commands without removing existing ones
            await rest.put(
                Routes.applicationCommands(config.bot.clientId),
                { body: globalCommands },
            );
            console.log(c.arrow + c.verde('Successfully reloaded global application (/) commands.'));
        }

        console.log(c.arrow + c.verde('Successfully reloaded application (/) commands.'));
    } catch (error) {
        console.error(c.error + " " + error);
    }
})();