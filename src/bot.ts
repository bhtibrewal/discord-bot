import { Client, Events, GatewayIntentBits } from "discord.js";
import { default as CommandHandler } from "./commands/index.ts";
import { config } from "./config.ts";

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

//   commandHandler.execute(message);
});


client.on(Events.InteractionCreate, async (interaction) => {
  await commandHandler.execute(interaction);
});

(async () => {
  await client.login(config.token);
})();
