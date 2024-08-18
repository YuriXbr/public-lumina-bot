# Lumina Bot

Lumina is a Discord bot designed to provide various funcionalidades relacionadas ao League of Legends, incluindo histórico de partidas e estatísticas. Por favor, note que Lumina está atualmente em BETA, e novas funcionalidades estão sendo continuamente desenvolvidas.

## Features

- Online bot admin configuration dashboard
- Customizable bot activity and status.
- Provide server and user information.
- Fetch match history and statistics from Riot Games API.
- Dashboard for managing bot settings.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/YuriXbr/lumina-bot.git
    cd lumina-bot
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Configure the bot:
    - Rename `src/private/config.example.json` to `src/private/config.json`.
    - Fill in the necessary details such as bot token, client ID, and Riot API key.

4. Deploy commands:
    ```sh
    npm run deploy
    ```

5. Start the bot:
    ```sh
    npm start
    ```

## Usage

- `/ping`: Check if the bot is online.
- `/server`: Get information about the server.
- `/user`: Get information about the user.
- `/leaguechampionrotation`: See the current champion rotation in League of Legends.
- `/leaguematchhistory`: Shows the match history of a League of Legends player.
- `/leagueprofile`: Get the profile information of a League of Legends player.

* More commands will be added in a near future.

## Dashboard Configuration

To configure and access the dashboard:

1. Ensure the dashboard is enabled in the `config.json` file:
    ```json
    "dashBoard": {
        "enabled": true, // Enable or disable the dashboard
        "port": 3000, // Port on which the dashboard will run
        "ip": "0.0.0.0", // IP address to bind the dashboard
        "auth": {
            "randPasswordLength": 32, // Length of the randomly generated password
            "randPasswordSlice": -16, // Slice of the randomly generated password to use
            "randomPassword": false, // Whether to use a random password
            "username": "admin", // Username for dashboard authentication
            "password": "admin" // Password for dashboard authentication
        }
    }
    ```

2. Start the bot:
    ```sh
    npm run start
    ```

3. Access the dashboard from another device on the same WLAN by navigating to `http://<your-computer-ip>:3000` in a web browser.

### Security Risks

- **Public Wi-Fi**: Accessing the dashboard over a public Wi-Fi network can expose your bot's tokens and credentials to potential attackers. It is recommended to use a secure, private network.
- **Token Exposure**: Ensure that your bot tokens and other sensitive information are not exposed in public repositories or shared with unauthorized individuals. Use environment variables or secure storage solutions to manage sensitive data.

## Configuration File Explanation

The `config.json` file contains various settings for the bot. Here is an explanation of each section: (This section could be outdated)

### Bot Configuration

```json
"bot": {
    "token": "YOUR_BOT_TOKEN",
    "clientId": "YOUR_CLIENT_ID",
    "prefix": "YOUR_PREFIX",
    "status": "online",
    "activity": {
        "type": "PLAYING",
        "name": "YOUR_ACTIVITY_TEXT"
    },
    "devmode": true // If true, commands will only be deployed to the configurated guilds
}
```

- **token:** The bot token provided by Discord.
- **clientId:** The client ID of the bot.
- **prefix:** The prefix used for bot commands.
- **status:** The status of the bot (e.g., online, idle, dnd).
- **activity:** The activity type and name displayed on the bot's profile.
- **devmode:** A boolean indicating if the bot is in development

```json
"staff": {
    "owners": ["OWNER_ID_1", "OWNER_ID_2"],
    "admins": [],
    "moderators": []
}
```

- **owners:** List of user IDs who have owner permissions.
- **admins:** List of user IDs who have admin permissions.
- **moderators:** List of user IDs who have moderator permissions.


```json
"guilds": {
    "main": "MAIN_GUILD_ID",
    "logs": {
        "guild": "LOGS_GUILD_ID",
        "startChannel": "START_CHANNEL_ID",
        "errorChannel": "ERROR_CHANNEL_ID",
        "debugChannel": "DEBUG_CHANNEL_ID",
        "staffChannel": "STAFF_CHANNEL_ID",
        "dashboardChannel": "DASHBOARD_CHANNEL_ID",
        "allChannel": "ALL_CHANNEL_ID"
    },
    "deployGuilds": ["GUILD_ID_1", "GUILD_ID_2"],
    "callTimer": {
        "enabled": true,
        "notificationGuild": "NOTIFICATION_GUILD_ID",
        "notificationChannel": "NOTIFICATION_CHANNEL_ID",
        "users": {
            "User1": "USER1_ID",
            "User2": "USER2_ID"
        }
    }
}
```

- **main:** The main guild ID where the bot operates.
- **logs:** Channels for logging different types of messages.
- **deployGuilds:** List of guild IDs where the bot commands are deployed.
- **callTimer:** Configuration for call timer notifications, including enabled status, guild, channel, and users. When two users from the list join in the same voice channel, a notification will be triggered.

```json
"riotApi": {
    "apiKey": "YOUR_RIOT_API_KEY",
    "region": "americas",
    "server": "br1",
    "baseUrl": "api.riotgames.com"
}
```
- **apiKey:** The API key for accessing Riot Games API.
- **region:** The region for the Riot API.
- **server:** The server for the Riot API.
- **baseUrl:** The base URL for the Riot API.


## **Contributing**
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## **License**
This project is licensed under the ISC License. To use this project, You have to agree with Discord and
Riot Games Terms Of Service and Privacy Policy

## **Disclaimer**
Lumina is currently in BETA. New features are being developed, and there may be bugs or incomplete functionalities. Please report any issues you encounter.

## **Contact**
For any questions or concerns, please contact the developer.

Thank you for using Lumina! ```