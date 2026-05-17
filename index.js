const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const express = require("express");
const app = express();

/* =========================
   WEB SERVICE FIX (RENDER)
========================= */
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server running");
});

/* =========================
   CLIENT
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
   CHANNEL IDS
========================= */
const WELCOME_CHANNEL_ID = "1504121883841270032";
const GOODBYE_CHANNEL_ID = "1504122077966368919";

/* =========================
   IMAGES
========================= */
const LOGO =
  "https://cdn.discordapp.com/attachments/1504463263872712924/1504890653153431683/Untitled_design.png";

const BANNER =
  "https://cdn.discordapp.com/attachments/1504463263872712924/1505517613483163690/WhatsApp_Image_2026-05-15_at_3.28.39_PM.jpeg";

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(client.user.tag + " is online!");
});

/* =========================
   COMMANDS
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  /* PAY COMMAND (UPDATED ONLY) */
  if (message.content === ".pay") {
    return message.channel.send(
      "💰 **Payment Methods (Eternal SMP)**\n\n" +
      "📱 **Bkash 1 (Personal → Personal):** 01741644334\n" +
      "📱 **Bkash 2 (Agent / Personal → Personal):** 01768166414\n\n" +
      "🏦 **UCB Bank Account:** 066 3209 001246842\n\n" +
      "🛒 Send screenshot in support ticket!"
    );
  }

  /* TICKET PANEL */
  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle("🎟️ Eternal SMP Support Center")
      .setDescription(
        "**Welcome to Support System**\n\n" +
        "Click below to create a ticket.\n\n" +
        "🛠️ Technical support\n" +
        "💰 Payment help\n" +
        "⚠️ Reports / Appeals"
      )
      .setThumbnail(LOGO)
      .setImage(BANNER)
      .setFooter({ text: "Eternal SMP Support System" })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("Create Ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

/* =========================
   INTERACTIONS
========================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "create_ticket") {

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

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle("🎫 Ticket Created")
      .setDescription(`Hello ${interaction.user}, explain your issue here.`)
      .setThumbnail(LOGO)
      .setImage(BANNER)
      .setTimestamp();

    const close = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(close);

    channel.send({ embeds: [embed], components: [row] });

    interaction.reply({
      content: `Ticket created: ${channel}`,
      ephemeral: true
    });
  }

  if (interaction.customId === "close_ticket") {
    await interaction.reply({ content: "Closing ticket...", ephemeral: true });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

/* =========================
   WELCOME
========================= */
client.on("guildMemberAdd", async (member) => {
  const channel = await client.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle("🎉 Welcome to Eternal SMP!")
    .setDescription(`Hey ${member}, welcome!\n\nMake sure to read rules and enjoy!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setImage(BANNER)
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
});

/* =========================
   GOODBYE
========================= */
client.on("guildMemberRemove", async (member) => {
  const channel = await client.channels.fetch(GOODBYE_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle("👋 Member Left Eternal SMP")
    .setDescription(`${member.user.tag} left the server.`)
    .setThumbnail(member.user.displayAvatarURL())
    .setImage(BANNER)
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
});

/* =========================
   LOGIN
========================= */
client.login(process.env.DISCORD_TOKEN);
