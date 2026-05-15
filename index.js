```js
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
   KEEP RENDER ALIVE
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
   IMAGES
========================= */
const LOGO =
  "https://cdn.discordapp.com/attachments/1504463263872712924/1504890653153431683/Untitled_design.png";

const BANNER =
  "https://cdn.discordapp.com/attachments/1504463263872712924/1504891150299959437/Untitled_design_1.png";

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
   BOT READY
========================= */
client.once("ready", () => {
  console.log(client.user.tag + " is online!");
});

/* =========================
   TICKET PANEL COMMAND
========================= */
client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setTitle("🎟️ Eternal SMP Support Center")
      .setDescription(
        "**Welcome to the Official Support System**\n\n" +
        "Click the button below to create a private support ticket.\n\n" +
        "🛠️ **You can use tickets for:**\n" +
        "1. Technical support\n" +
        "2. General question\n" +
        "3. Payment and store help\n" +
        "4. Report violations or appeal penalties\n\n" +
        "⚡ Please avoid unnecessary tickets."
      )
      .setThumbnail(LOGO)
      .setImage(BANNER)
      .setFooter({
        text: `${message.guild.name} • Support System`,
        iconURL: LOGO
      })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("Create Ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary);

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
client.on("interactionCreate", async (interaction) => {

  if (!interaction.isButton()) return;

  /* CREATE TICKET */
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

    const ticketEmbed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle("🎫 Ticket Created")
      .setDescription(
        `Hello ${interaction.user}, support will assist you shortly.\n\n` +
        `Please explain your issue clearly.`
      )
      .setThumbnail(LOGO)
      .setImage(BANNER)
      .setFooter({
        text: "Eternal SMP Support"
      })
      .setTimestamp();

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger);

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
  if (interaction.customId === "close_ticket") {

    await interaction.reply({
      content: "🔒 Closing ticket...",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

/* =========================
   WELCOME EMBED
========================= */
client.on("guildMemberAdd", async (member) => {

  try {

    const channel = await client.channels.fetch(WELCOME_CHANNEL_ID);

    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle("🎉 Welcome to Eternal SMP!")
      .setDescription(
        `Hey ${member}, welcome! 🎉\n\n` +
        `Make sure to check the rules and enjoy your time here!`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({
        name: member.user.tag,
        iconURL: LOGO
      })
      .setImage(BANNER)
      .setFooter({
        text: `Member #${member.guild.memberCount}`,
        iconURL: LOGO
      })
      .setTimestamp();

    channel.send({
      embeds: [welcomeEmbed]
    });

  } catch (err) {
    console.log(err);
  }
});

/* =========================
   GOODBYE EMBED
========================= */
client.on("guildMemberRemove", async (member) => {

  try {

    const channel = await client.channels.fetch(GOODBYE_CHANNEL_ID);

    if (!channel) return;

    const goodbyeEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle("👋 Member Left Eternal SMP")
      .setDescription(
        `**${member.user.tag}** has left the server.\n\n` +
        `Goodbye 😢`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({
        name: member.user.tag,
        iconURL: LOGO
      })
      .setImage(BANNER)
      .setFooter({
        text: `${member.guild.memberCount} members remaining`,
        iconURL: LOGO
      })
      .setTimestamp();

    channel.send({
      embeds: [goodbyeEmbed]
    });

  } catch (err) {
    console.log(err);
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.DISCORD_TOKEN);
```
