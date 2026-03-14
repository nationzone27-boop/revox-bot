// ═══════════════════════════════════════════════════
//   REVOX CREATIVES — OFFICIAL DISCORD BOT
//   Features: Welcome, Auto-roles, Applications,
//             Announcements, Commands, Verification
// ═══════════════════════════════════════════════════

require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits,
  ActivityType,
  Colors
} = require('discord.js');

// ── CLIENT SETUP ──
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// ── BRAND COLORS ──
const RED   = 0xFF1E1E;
const BLACK = 0x080808;
const GREY  = 0x222222;

// ── SLASH COMMANDS DEFINITION ──
const commands = [
  new SlashCommandBuilder()
    .setName('revox')
    .setDescription('Show Revox Creatives info and links'),

  new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Apply to join Revox Creatives as a gaming creator'),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post a branded announcement (Admin only)')
    .addStringOption(opt =>
      opt.setName('title').setDescription('Announcement title').setRequired(true))
    .addStringOption(opt =>
      opt.setName('message').setDescription('Announcement message').setRequired(true))
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Type of announcement')
        .setRequired(false)
        .addChoices(
          { name: '📢 General', value: 'general' },
          { name: '🎉 Event', value: 'event' },
          { name: '🤝 Brand Deal', value: 'brand' },
          { name: '🏆 Esports', value: 'esports' },
          { name: '🎮 Gaming', value: 'gaming' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify yourself as a real member of the community'),

  new SlashCommandBuilder()
    .setName('setrole')
    .setDescription('Set your role in the community')
    .addStringOption(opt =>
      opt.setName('role')
        .setDescription('Choose your role')
        .setRequired(true)
        .addChoices(
          { name: '🎮 Creator', value: 'creator' },
          { name: '🏷️ Brand', value: 'brand' }
        )),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is alive'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all Revox bot commands'),
].map(cmd => cmd.toJSON());

// ── REGISTER SLASH COMMANDS ──
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
}

// ── BOT READY ──
client.once('ready', async () => {
  console.log(`✅ Revox Bot is online as ${client.user.tag}`);

  // Set bot status
  client.user.setPresence({
    activities: [{
      name: 'Creating Winners Beyond The Game',
      type: ActivityType.Watching
    }],
    status: 'online'
  });

  await registerCommands();
});

// ── WELCOME NEW MEMBERS ──
client.on('guildMemberAdd', async (member) => {
  try {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return;

    // Auto-assign Member role
    const memberRole = member.guild.roles.cache.get(process.env.MEMBER_ROLE_ID);
    if (memberRole) await member.roles.add(memberRole);

    const embed = new EmbedBuilder()
      .setColor(RED)
      .setTitle('REVOX CREATIVES')
      .setDescription(`## Welcome, ${member}! 🔥\n\nYou've just joined **India's Gaming Talent Agency**.\n\n*Creating Winners Beyond The Game.*`)
      .addFields(
        {
          name: '🎮 What is Revox Creatives?',
          value: 'We represent BGMI, Valorant & Free Fire creators. Brand deals, growth strategy, media kits and esports access — all under one roof.',
          inline: false
        },
        {
          name: '📋 Get Started',
          value: '> Use `/setrole` to set yourself as Creator or Brand\n> Use `/apply` to apply to join our roster\n> Use `/verify` to get verified\n> Use `/revox` to see all our links',
          inline: false
        },
        {
          name: '📍 Find Us',
          value: '🌐 revoxcreatives.in\n📸 @revox_creatives\n📧 info@revoxcreatives.in',
          inline: false
        }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Revox Creatives • Pune, India • Est. 2026' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Visit Website')
        .setStyle(ButtonStyle.Link)
        .setURL('https://revoxcreatives.in'),
      new ButtonBuilder()
        .setLabel('Apply to Join')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('apply_btn'),
      new ButtonBuilder()
        .setLabel('Instagram')
        .setStyle(ButtonStyle.Link)
        .setURL('https://instagram.com/revox_creatives')
    );

    await channel.send({ embeds: [embed], components: [row] });

    // Send DM to new member
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(RED)
        .setTitle('Welcome to Revox Creatives! 🔥')
        .setDescription(`Hey ${member.displayName}!\n\nThanks for joining the **Revox Creatives** Discord server.\n\nWe're India's gaming talent agency. If you're a BGMI, Valorant or Free Fire creator with 25K+ followers — we'd love to have you on our roster.`)
        .addFields(
          { name: 'Apply to Join', value: 'Use `/apply` in the server or email us at info@revoxcreatives.in', inline: false },
          { name: 'Our Website', value: 'https://revoxcreatives.in', inline: false }
        )
        .setFooter({ text: 'Revox Creatives • Creating Winners Beyond The Game' });

      await member.send({ embeds: [dmEmbed] });
    } catch {
      // DMs may be closed — that's fine
    }

  } catch (err) {
    console.error('Welcome error:', err);
  }
});

// ── SLASH COMMAND HANDLER ──
client.on('interactionCreate', async (interaction) => {

  // ── BUTTON INTERACTIONS ──
  if (interaction.isButton()) {
    if (interaction.customId === 'apply_btn') {
      await showApplicationModal(interaction);
    }
    return;
  }

  // ── MODAL SUBMIT ──
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'apply_modal') {
      await handleApplication(interaction);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // ── /revox ──
  if (commandName === 'revox') {
    const embed = new EmbedBuilder()
      .setColor(RED)
      .setTitle('REVOX CREATIVES')
      .setDescription("**India's Gaming Talent Agency**\n*Creating Winners Beyond The Game.*")
      .addFields(
        { name: '🎮 Games', value: 'BGMI • Valorant • Free Fire', inline: true },
        { name: '📍 Location', value: 'Pune, Maharashtra, India', inline: true },
        { name: '💰 Fee', value: '₹0 Monthly Fee', inline: true },
        { name: '🔗 Links', value: '🌐 [Website](https://revoxcreatives.in)\n📸 [Instagram](https://instagram.com/revox_creatives)\n📧 info@revoxcreatives.in', inline: false },
        { name: '📋 Apply', value: 'Use `/apply` to join the Revox creator roster', inline: false }
      )
      .setFooter({ text: 'Revox Creatives • Est. 2026' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Website').setStyle(ButtonStyle.Link).setURL('https://revoxcreatives.in'),
      new ButtonBuilder().setLabel('Apply Now').setStyle(ButtonStyle.Primary).setCustomId('apply_btn'),
      new ButtonBuilder().setLabel('Instagram').setStyle(ButtonStyle.Link).setURL('https://instagram.com/revox_creatives')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  // ── /apply ──
  else if (commandName === 'apply') {
    await showApplicationModal(interaction);
  }

  // ── /verify ──
  else if (commandName === 'verify') {
    try {
      const verifiedRole = interaction.guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);
      if (!verifiedRole) {
        return interaction.reply({ content: '❌ Verified role not configured. Contact an admin.', ephemeral: true });
      }

      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (member.roles.cache.has(process.env.VERIFIED_ROLE_ID)) {
        return interaction.reply({ content: '✅ You are already verified!', ephemeral: true });
      }

      await member.roles.add(verifiedRole);

      const embed = new EmbedBuilder()
        .setColor(RED)
        .setTitle('✅ Verified!')
        .setDescription(`${interaction.user} you are now a verified member of **Revox Creatives**.\n\nWelcome to the community! Use \`/apply\` to join our creator roster.`)
        .setFooter({ text: 'Revox Creatives' });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: '❌ Error verifying. Contact an admin.', ephemeral: true });
    }
  }

  // ── /setrole ──
  else if (commandName === 'setrole') {
    const choice = interaction.options.getString('role');
    const member = interaction.guild.members.cache.get(interaction.user.id);

    let roleId, roleName, emoji;
    if (choice === 'creator') {
      roleId = process.env.CREATOR_ROLE_ID;
      roleName = 'Creator';
      emoji = '🎮';
    } else {
      roleId = process.env.BRAND_ROLE_ID;
      roleName = 'Brand';
      emoji = '🏷️';
    }

    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
      return interaction.reply({ content: '❌ Role not configured. Contact an admin.', ephemeral: true });
    }

    await member.roles.add(role);

    const embed = new EmbedBuilder()
      .setColor(RED)
      .setDescription(`${emoji} You've been assigned the **${roleName}** role!\n\n${choice === 'creator' ? 'Use `/apply` to apply to join the Revox creator roster.' : 'Email us at info@revoxcreatives.in to discuss creator campaigns.'}`)
      .setFooter({ text: 'Revox Creatives' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // ── /announce ──
  else if (commandName === 'announce') {
    const title   = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const type    = interaction.options.getString('type') || 'general';

    const typeMap = {
      general: { emoji: '📢', label: 'Announcement' },
      event:   { emoji: '🎉', label: 'Event' },
      brand:   { emoji: '🤝', label: 'Brand Deal' },
      esports: { emoji: '🏆', label: 'Esports' },
      gaming:  { emoji: '🎮', label: 'Gaming Update' }
    };

    const t = typeMap[type];

    const channel = interaction.guild.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID);
    if (!channel) {
      return interaction.reply({ content: '❌ Announcements channel not set.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(RED)
      .setAuthor({ name: `${t.emoji} ${t.label} — Revox Creatives` })
      .setTitle(title)
      .setDescription(message)
      .addFields({ name: '🌐 Website', value: '[revoxcreatives.in](https://revoxcreatives.in)', inline: true })
      .setFooter({ text: `Revox Creatives • Posted by ${interaction.user.tag}` })
      .setTimestamp();

    await channel.send({ content: '@everyone', embeds: [embed] });
    await interaction.reply({ content: `✅ Announcement posted in ${channel}!`, ephemeral: true });
  }

  // ── /ping ──
  else if (commandName === 'ping') {
    const ping = client.ws.ping;
    await interaction.reply({ content: `🏓 Pong! Bot latency: **${ping}ms**`, ephemeral: true });
  }

  // ── /help ──
  else if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setColor(RED)
      .setTitle('REVOX BOT — Commands')
      .setDescription('All available commands for the Revox Creatives server:')
      .addFields(
        { name: '`/revox`', value: 'Show agency info, links and contact', inline: false },
        { name: '`/apply`', value: 'Apply to join the Revox creator roster', inline: false },
        { name: '`/verify`', value: 'Get verified as a real community member', inline: false },
        { name: '`/setrole`', value: 'Set your role as Creator or Brand', inline: false },
        { name: '`/announce`', value: 'Post a branded announcement *(Admin only)*', inline: false },
        { name: '`/ping`', value: 'Check bot status', inline: false },
      )
      .setFooter({ text: 'Revox Creatives • revoxcreatives.in' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// ── APPLICATION MODAL ──
async function showApplicationModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('apply_modal')
    .setTitle('Apply to Revox Creatives');

  const nameInput = new TextInputBuilder()
    .setCustomId('name')
    .setLabel('Your Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Full name')
    .setRequired(true);

  const handleInput = new TextInputBuilder()
    .setCustomId('handle')
    .setLabel('YouTube / Instagram Handle')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('@yourhandle or channel link')
    .setRequired(true);

  const gameInput = new TextInputBuilder()
    .setCustomId('game')
    .setLabel('Main Game')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('BGMI / Valorant / Free Fire')
    .setRequired(true);

  const followersInput = new TextInputBuilder()
    .setCustomId('followers')
    .setLabel('Total Followers / Subscribers')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. 30K YouTube + 15K Instagram')
    .setRequired(true);

  const goalInput = new TextInputBuilder()
    .setCustomId('goal')
    .setLabel('Why do you want to join Revox?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Tell us about your goals and what you want from the agency...')
    .setRequired(true)
    .setMaxLength(500);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(handleInput),
    new ActionRowBuilder().addComponents(gameInput),
    new ActionRowBuilder().addComponents(followersInput),
    new ActionRowBuilder().addComponents(goalInput)
  );

  await interaction.showModal(modal);
}

// ── HANDLE APPLICATION SUBMISSION ──
async function handleApplication(interaction) {
  const name      = interaction.fields.getTextInputValue('name');
  const handle    = interaction.fields.getTextInputValue('handle');
  const game      = interaction.fields.getTextInputValue('game');
  const followers = interaction.fields.getTextInputValue('followers');
  const goal      = interaction.fields.getTextInputValue('goal');

  // Send to applications channel
  const appChannel = interaction.guild.channels.cache.get(process.env.APPLICATIONS_CHANNEL_ID);
  if (appChannel) {
    const embed = new EmbedBuilder()
      .setColor(RED)
      .setTitle('🎮 New Creator Application')
      .addFields(
        { name: '👤 Name',       value: name,      inline: true },
        { name: '🎮 Game',       value: game,       inline: true },
        { name: '📊 Followers',  value: followers,  inline: true },
        { name: '🔗 Handle',     value: handle,     inline: false },
        { name: '💬 Why Revox?', value: goal,       inline: false },
        { name: '📧 Discord',    value: `${interaction.user.tag} (${interaction.user.id})`, inline: false }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Revox Creatives Applications • ${new Date().toLocaleDateString('en-IN')}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('✅ Accept').setStyle(ButtonStyle.Success).setCustomId(`accept_${interaction.user.id}`),
      new ButtonBuilder().setLabel('❌ Decline').setStyle(ButtonStyle.Danger).setCustomId(`decline_${interaction.user.id}`)
    );

    await appChannel.send({ embeds: [embed], components: [row] });
  }

  // Confirm to applicant
  const confirmEmbed = new EmbedBuilder()
    .setColor(RED)
    .setTitle('✅ Application Received!')
    .setDescription(`Thanks **${name}**! Your application to join Revox Creatives has been submitted.\n\nWe review every application personally and will get back to you within **48 hours**.\n\nIn the meantime, explore the server and say hi to the community!`)
    .addFields(
      { name: '📧 Email', value: 'info@revoxcreatives.in', inline: true },
      { name: '📸 Instagram', value: '@revox_creatives', inline: true }
    )
    .setFooter({ text: 'Revox Creatives • Creating Winners Beyond The Game' });

  await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}

// ── ERROR HANDLING ──
client.on('error', console.error);
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));

// ── LOGIN ──
client.login(process.env.BOT_TOKEN);
