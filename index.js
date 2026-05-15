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

const express = require("express");
const app = express();

/* =========================
   RENDER KEEP-ALIVE FIX
========================= */
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server running");
});

/* =========================
   CHANNEL IDS
========================= */
const WELCOME_CHANNEL_ID = "1504121883841270032";
const GOODBYE_CHANNEL_ID = "1504122077966368919";

/* =========================
   DISCORD CLIENT
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

/* =========================
   READY
========================= */
client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

/* =========================
   TICKET PANEL
========================= */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!panel') {

    const embed = new EmbedBuilder()
      .setTitle('🎟️ Support Center')
      .setDescription(
        "**Welcome to the Official Support System**\n\n" +
        "Click the button below to create a private ticket.\n\n" +
        "🛠️ You can use tickets for:\n" +
        "1. Technical support\n" +
        "2. General question\n" +
        "3. Payment and store help\n" +
        "4. Report violations or appeal penalties\n\n" +
        "⚡ Please avoid unnecessary tickets."
      )
      .setColor(0x2B2D31)
      .setThumbnail(message.guild.iconURL())
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
   BUTTON SYSTEM
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
      .setDescription(`Hello ${interaction.user}, please describe your issue.`)
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

    await interaction.reply({
      content: '🔒 Closing ticket...',
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

/* =========================
   WELCOME MESSAGE
========================= */
client.on('guildMemberAdd', (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  channel.send(
    `🎉 Welcome to Eternal SMP! 🎉\n\n` +
    `Hey ${member}, welcome! 🎉\n\n` +
    `Make sure to check the rules and enjoy your time here!`
  );
});

/* =========================
   GOODBYE MESSAGE
========================= */
client.on('guildMemberRemove', (member) => {
  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (!channel) return;

  channel.send(
    `👋 ${member.user.tag} just left Eternal SMP...\nGoodbye 😢`
  );
});

/* =========================
   LOGIN
========================= */
client.login(process.env.DISCORD_TOKEN);
