const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

/* =========================
   TICKET PANEL COMMAND
========================= */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!panel') {

    const embed = new EmbedBuilder()
      .setTitle('🎟️ Support Center')
      .setDescription(
        "**Welcome to the Official Support System**\n\n" +
        "Click the button below to create a private ticket.\n\n" +
        "🛠️ **You can use tickets for:**\n" +
        "1. Technical support\n" +
        "2. General question\n" +
        "3. Payment and store help\n" +
        "4. Report violations or appeal penalties\n\n" +
        "⚡ Please avoid unnecessary tickets."
      )
      .setColor(0x2B2D31)
      .setThumbnail(message.guild.iconURL())
      .addFields(
        { name: '📌 Status', value: 'Online', inline: true },
        { name: '⏱️ Response Time', value: 'Under 10 minutes', inline: true },
        { name: '👮 Staff', value: 'Available 24/7', inline: true }
      )
      .setFooter({
        text: `${message.guild.name} • Ticket System`,
        iconURL: message.guild.iconURL()
      })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create Ticket')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫');

    const row = new ActionRowBuilder().addComponents(button);

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

/* =========================
   BUTTON INTERACTIONS
========================= */
client.on('interactionCreate', async (interaction) => {

  if (!interaction.isButton()) return;

  /* CREATE TICKET */
  if (interaction.customId === 'create_ticket') {

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,

      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ],
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels
          ],
        }
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 Ticket Created')
      .setDescription(
        `Hello ${interaction.user}, support will assist you shortly.\n\n` +
        `Please describe your issue clearly so staff can help you faster.`
      )
      .setColor(0x57F287)
      .setTimestamp();

    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒');

    const row = new ActionRowBuilder().addComponents(closeButton);

    channel.send({
      embeds: [ticketEmbed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ Ticket created: ${channel}`,
      ephemeral: true
    });
  }

  /* CLOSE TICKET */
  if (interaction.customId === 'close_ticket') {

    const channel = interaction.channel;

    await interaction.reply({
      content: '🔒 Closing ticket...',
      ephemeral: true
    });

    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 3000);
  }
});

client.login(process.env.DISCORD_TOKEN);