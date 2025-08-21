import {
  REST,
  Routes,
} from "discord.js";
import { config } from "./config";
import CommandHandler from "./commands/index";


const commandHandler = new CommandHandler();
const commandsData = commandHandler.getCommandsData();

const rest = new REST({ version: "10" }).setToken(config.token!);

async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    if (config.guildId) {
      // Deploy commands to specific guild (faster for development)
      await rest.put(
        Routes.applicationGuildCommands(config.clientId!, config.guildId),
        { body: commandsData }
      );
      console.log(
        "Successfully registered application commands for development guild."
      );
    } else {
      // Deploy commands globally
      await rest.put(Routes.applicationCommands(config.clientId!), {
        body: commandsData,
      });
      console.log("Successfully registered application commands globally.");
    }
  } catch (error) {
    console.error(error);
  }
}

deployCommands();
