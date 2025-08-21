import { Client, Events, GatewayIntentBits } from "discord.js";
import { default as CommandHandler } from "./commands/index";
import { config } from "./config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const commandHandler = new CommandHandler();

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag} in ${client.guilds.cache.size} guilds.`);
});

client.on(Events.MessageCreate, (message) => {
  console.log(`Received message: ${message.content}`);
  if (message.author.bot) return;
  message.reply(`hello ${message.author.username}`)
});


client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    await commandHandler.execute(interaction);
  }
});

(async () => {
  await client.login(config.token);
})();
