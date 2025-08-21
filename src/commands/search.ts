import {
  ChatInputCommandInteraction,
  TextChannel,
  Message,
} from "discord.js";

export async function execute(interaction: ChatInputCommandInteraction) {
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
    const textChannelsArray = Array.from(textChannels.values());
    const totalChannels = textChannelsArray.length;
    let processedChannels = 0;

    // Initial progress message
    await interaction.editReply(
      `Starting search in ${totalChannels} channels...`
    );

    for (const channel of textChannelsArray) {
      try {
        processedChannels++;
        let lastMessageId: string | undefined;
        let messagesFound = 0;

        // Update progress every channel
        await interaction.editReply(
          `Searching channel ${processedChannels}/${totalChannels}: #${channel.name}\n` +
            `Messages found so far: ${results.length}`
        );

        while (true) {
          // Fetch messages in batches of 100
          const options: { limit: number; before?: string } = { limit: 100 };
          if (lastMessageId) options.before = lastMessageId;

          const messages = await channel.messages.fetch(options);
          if (messages.size === 0) break; // No more messages

          // Update lastMessageId for next iteration
          lastMessageId = messages.last()?.id;

          // Process messages in this batch
          messages.forEach((message: Message) => {
            if (
              message.content.toLowerCase().includes(word.toLowerCase()) &&
              message.content.length >= parseInt(charLimit)
            ) {
              results.push({
                messageId: message.id,
                content: message.content,
                channelName: channel.name,
              });
              messagesFound++;
            }
          });

          // Update progress for large channels every 500 messages
          if (messagesFound > 0 && messagesFound % 500 === 0) {
            await interaction.editReply(
              `Searching channel ${processedChannels}/${totalChannels}: #${channel.name}\n` +
                `Messages found in this channel: ${messagesFound}\n` +
                `Total messages found: ${results.length}`
            );
          }

          // Break if we've found more than 100 matches to avoid rate limits
          if (results.length > 100) {
            await interaction.editReply(
              "Search stopped: Found more than 100 matching messages. Please refine your search criteria."
            );
            return;
          }
        }
      } catch (error) {
        console.error(
          `Error fetching messages from channel ${channel.name}:`,
          error
        );
        // Continue with other channels if one fails
        await interaction.editReply(
          `Error searching in #${channel.name}, continuing with other channels...\n` +
            `Progress: ${processedChannels}/${totalChannels} channels searched`
        );
      }
    }

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
