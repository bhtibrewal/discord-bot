import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { execute as searchExecute } from "./search";

class CommandHandler {
  private commands: Map<string, any>;
  private commandExecutes: Map<
    string,
    (interaction: ChatInputCommandInteraction) => Promise<void>
  >;

  constructor() {
    this.commands = new Map();
    this.commandExecutes = new Map();
    this.registerCommands();
  }

  private registerCommands() {
    // Hey command
    const heyCommand = new SlashCommandBuilder()
      .setName("hey")
      .setDescription("Replies with hey");
    this.commands.set("hey", heyCommand);
    this.commandExecutes.set("hey", async (interaction) => {
      await interaction.reply("Hey there! 👋");
    });

    // Ping command
    const pingCommand = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with pong");
    this.commands.set("ping", pingCommand);
    this.commandExecutes.set("ping", async (interaction) => {
      await interaction.reply("Pong! 🏓");
    });

    // Find message command
    const findMessageCommand = new SlashCommandBuilder()
      .setName("findmessage")
      .setDescription("Finds all the messages with the given word")
      .addStringOption((option) =>
        option
          .setName("search-keyword")
          .setDescription("The keyword we want to look for in the message")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("limit")
          .setDescription("The minimum word limit for the message")
          .setRequired(true)
      );
    this.commands.set("findmessage", findMessageCommand);
    this.commandExecutes.set("findmessage", searchExecute);
  }

  getCommandsData() {
    return Array.from(this.commands.values()).map((command) =>
      command.toJSON()
    );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    const commandExecute = this.commandExecutes.get(commandName);

    if (!commandExecute) {
      await interaction.reply({
        content: "Command not found!",
        ephemeral: true,
      });
      return;
    }

    try {
      await commandExecute(interaction);
    } catch (error) {
      console.error(`Error executing ${commandName} command:`, error);
      const reply = {
        content: "There was an error executing this command!",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
}

export default CommandHandler;