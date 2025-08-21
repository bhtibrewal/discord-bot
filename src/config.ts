import 'dotenv/config';

export const config = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID // Optional: for development, you might want to register commands to a specific server
};
