import {
  CommandInteraction,
  SlashCommandBuilder,
  TextChannel,
  Message,
  Collection,
} from "discord.js";

export async function execute(interaction: CommandInteraction) {
  // Defer reply as this operation might take some time
  await interaction.deferReply();

  const word = interaction.options.getString("search-keyword")!;
  const charLimit = interaction.options.getString("limit")!;

  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("This command can only be used in a server.");
      return;
    }

    let results: { messageId: string; content: string; channelName: string }[] =
      [];

    // Fetch all channels
    const channels = await guild.channels.fetch();

    // Filter text channels only
    const textChannels = channels.filter(
      (channel): channel is TextChannel =>
        channel?.type === 0 && channel.viewable
    );

    // Search through each channel
    await Promise.all(
      Array.from(textChannels.values()).map(async (channel: TextChannel) => {
        try {
          let messages: Collection<string, Message> =
            await channel.messages.fetch({ limit: 100 });

          messages.forEach((message: Message) => {
            if (
              message.content &&
              message.content.toLowerCase().includes(word.toLowerCase()) &&
              message.content.length >= charLimit
            ) {
              results.push({
                messageId: message.id,
                content: message.content,
                channelName: channel.name,
              });
            }
          });
        } catch (error) {
          console.error(
            `Error fetching messages from channel ${channel.name}:`,
            error
          );
        }
      })
    );

    if (results.length === 0) {
      await interaction.editReply(
        `No messages found containing "${word}" with ${charLimit} or more characters.`
      );
      return;
    }

    // Format results
    let response = `Found ${results.length} message(s) containing "${word}" with ${charLimit} or more characters:\n\n`;

    for (const result of results) {
      const snippet = `Channel: #${result.channelName}\nMessage ID: ${result.messageId}\nContent: ${result.content}\n\n`;

      // Discord has a 2000 character limit for messages
      if (response.length + snippet.length > 1900) {
        response += "... and more (truncated due to message length limit)";
        break;
      }

      response += snippet;
    }

    await interaction.editReply(response);
  } catch (error) {
    console.error("Error executing search command:", error);
    await interaction.editReply("An error occurred while searching messages.");
  }
}
