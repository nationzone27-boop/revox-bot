// ═══════════════════════════════════════════════════
//   REVOX CREATIVES — OFFICIAL DISCORD BOT v2
//   Features: Welcome DM, Rules, Tournament Manager,
//             Mimu-style Economy, Applications, Announcements
// ═══════════════════════════════════════════════════

require('dotenv').config();

const {
  Client, GatewayIntentBits, Partials, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ActivityType,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

const RED   = 0xFF1E1E;
const GOLD  = 0xFFD700;
const GREEN = 0x00C853;

// ── STORES ──
const economy  = new Map();
const tourneys = new Map();
let   tid      = 1;

function getUser(id) {
  if (!economy.has(id)) economy.set(id, { coins: 0, xp: 0, level: 1, rep: 0, lastDaily: 0 });
  return economy.get(id);
}
function addXP(id, amt) {
  const u = getUser(id);
  u.xp += amt;
  if (u.xp >= u.level * 100) { u.xp = 0; u.level++; return true; }
  return false;
}

// ── COMMANDS LIST ──
const commands = [
  new SlashCommandBuilder().setName('revox').setDescription('Show Revox Creatives info and links'),
  new SlashCommandBuilder().setName('apply').setDescription('Apply to join Revox Creatives'),
  new SlashCommandBuilder().setName('verify').setDescription('Verify yourself as a real community member'),
  new SlashCommandBuilder().setName('ping').setDescription('Check bot status'),
  new SlashCommandBuilder().setName('help').setDescription('Show all commands'),
  new SlashCommandBuilder().setName('rules').setDescription('Show server rules'),
  new SlashCommandBuilder().setName('daily').setDescription('Claim your daily RX Coins'),
  new SlashCommandBuilder().setName('balance').setDescription('Check your RX Coins balance'),
  new SlashCommandBuilder().setName('level').setDescription('Check your level and XP'),
  new SlashCommandBuilder().setName('leaderboard').setDescription('Top RX Coin holders'),
  new SlashCommandBuilder().setName('shop').setDescription('RX Coins shop'),
  new SlashCommandBuilder()
    .setName('rep').setDescription('Give reputation to a member')
    .addUserOption(o => o.setName('user').setDescription('Who to rep').setRequired(true)),
  new SlashCommandBuilder()
    .setName('give').setDescription('Give RX Coins to someone (Admin)')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder()
    .setName('setrole').setDescription('Set your role')
    .addStringOption(o => o.setName('role').setDescription('Role').setRequired(true)
      .addChoices({ name: '🎮 Creator', value: 'creator' }, { name: '🏷️ Brand', value: 'brand' })),
  new SlashCommandBuilder()
    .setName('announce').setDescription('Post announcement (Admin)')
    .addStringOption(o => o.setName('title').setDescription('Title').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('Type').setRequired(false)
      .addChoices(
        { name: '📢 General', value: 'general' }, { name: '🎉 Event', value: 'event' },
        { name: '🤝 Brand Deal', value: 'brand' }, { name: '🏆 Esports', value: 'esports' },
        { name: '🎮 Gaming', value: 'gaming' }
      ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder()
    .setName('tourney').setDescription('Tournament management')
    .addSubcommand(s => s.setName('create').setDescription('Create tournament (Admin)')
      .addStringOption(o => o.setName('name').setDescription('Name').setRequired(true))
      .addStringOption(o => o.setName('game').setDescription('Game').setRequired(true)
        .addChoices({ name: 'BGMI', value: 'BGMI' }, { name: 'Valorant', value: 'Valorant' },
          { name: 'Free Fire', value: 'Free Fire' }, { name: 'Other', value: 'Other' }))
      .addStringOption(o => o.setName('date').setDescription('Date & time').setRequired(true))
      .addIntegerOption(o => o.setName('slots').setDescription('Max slots').setRequired(true)))
    .addSubcommand(s => s.setName('register').setDescription('Register for tournament')
      .addIntegerOption(o => o.setName('id').setDescription('Tournament ID').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('Show all tournaments'))
    .addSubcommand(s => s.setName('info').setDescription('Tournament details')
      .addIntegerOption(o => o.setName('id').setDescription('Tournament ID').setRequired(true)))
    .addSubcommand(s => s.setName('cancel').setDescription('Cancel tournament (Admin)')
      .addIntegerOption(o => o.setName('id').setDescription('Tournament ID').setRequired(true))),
].map(c => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commands });
    console.log('✅ Commands registered!');
  } catch (e) { console.error('❌', e); }
}

client.once('ready', async () => {
  console.log(`✅ Revox Bot v2 online as ${client.user.tag}`);
  client.user.setPresence({ activities: [{ name: 'Creating Winners Beyond The Game', type: ActivityType.Watching }], status: 'online' });
  await registerCommands();
});

// ── WELCOME ──
client.on('guildMemberAdd', async (member) => {
  try {
    const ch = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    const mRole = member.guild.roles.cache.get(process.env.MEMBER_ROLE_ID);
    if (mRole) await member.roles.add(mRole);

    const u = getUser(member.user.id);
    u.coins += 50;

    if (ch) {
      const embed = new EmbedBuilder().setColor(RED)
        .setTitle('🎮 WELCOME TO REVOX CREATIVES')
        .setDescription(`Hey ${member}! You just joined **India's Gaming Talent Agency**.\n\n🎁 You received **50 RX Coins** as a welcome gift!\n\n*Creating Winners Beyond The Game.*`)
        .addFields(
          { name: '📋 Get Started', value: '> `/setrole` — Set as Creator or Brand\n> `/apply` — Apply to our creator roster\n> `/verify` — Get verified\n> `/rules` — Read server rules\n> `/daily` — Claim daily RX Coins\n> `/tourney list` — See tournaments', inline: false },
          { name: '🔗 Find Us', value: '🌐 [revoxcreatives.in](https://revoxcreatives.in)\n📸 [@revox_creatives](https://instagram.com/revox_creatives)\n📧 info@revoxcreatives.in', inline: false }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Revox Creatives • Est. 2025' }).setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Website').setStyle(ButtonStyle.Link).setURL('https://revoxcreatives.in'),
        new ButtonBuilder().setLabel('Apply Now').setStyle(ButtonStyle.Primary).setCustomId('apply_btn'),
        new ButtonBuilder().setLabel('Instagram').setStyle(ButtonStyle.Link).setURL('https://instagram.com/revox_creatives')
      );
      await ch.send({ embeds: [embed], components: [row] });
    }

    // WELCOME DM
    try {
      const dm = new EmbedBuilder().setColor(RED)
        .setTitle('👋 Welcome to Revox Creatives!')
        .setDescription(`Hey **${member.displayName}**! Thanks for joining.\n\nHere's your quick onboarding guide:`)
        .addFields(
          { name: '1️⃣ Set Your Role',     value: 'Use `/setrole` — pick Creator or Brand', inline: false },
          { name: '2️⃣ Get Verified',       value: 'Use `/verify` to unlock all channels', inline: false },
          { name: '3️⃣ Apply to Roster',    value: 'Use `/apply` — 25K+ followers, zero monthly fee', inline: false },
          { name: '4️⃣ Check Tournaments',  value: 'Use `/tourney list` for upcoming events', inline: false },
          { name: '5️⃣ Earn RX Coins',      value: 'Use `/daily` every day — check `/shop` for rewards', inline: false },
          { name: '6️⃣ Read the Rules',     value: 'Use `/rules` to stay in good standing', inline: false },
          { name: '🎁 Welcome Gift',        value: 'You have been given **50 RX Coins** to start!', inline: false },
          { name: '🔗 Links',               value: '🌐 revoxcreatives.in\n📸 @revox_creatives\n📧 info@revoxcreatives.in', inline: false }
        )
        .setFooter({ text: 'Revox Creatives • Creating Winners Beyond The Game' });
      await member.send({ embeds: [dm] });
    } catch {}
  } catch (e) { console.error('Welcome error:', e); }
});

// ── INTERACTIONS ──
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'apply_btn') await showModal(interaction);
    return;
  }
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'apply_modal') await handleApp(interaction);
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  const cmd = interaction.commandName;

  if (cmd === 'ping') return interaction.reply({ content: `🏓 **${client.ws.ping}ms**`, ephemeral: true });

  if (cmd === 'revox') {
    const e = new EmbedBuilder().setColor(RED).setTitle('REVOX CREATIVES')
      .setDescription("**India's Gaming Talent Agency** — *Creating Winners Beyond The Game.*")
      .addFields(
        { name: '🎮 Games', value: 'All Mobile & PC Games', inline: true },
        { name: '💰 Fee',   value: '₹0 Monthly Fee', inline: true },
        { name: '🔗 Links', value: '[Website](https://revoxcreatives.in) • [Instagram](https://instagram.com/revox_creatives) • info@revoxcreatives.in', inline: false }
      ).setFooter({ text: 'Revox Creatives • Est. 2025' }).setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Website').setStyle(ButtonStyle.Link).setURL('https://revoxcreatives.in'),
      new ButtonBuilder().setLabel('Apply Now').setStyle(ButtonStyle.Primary).setCustomId('apply_btn'),
      new ButtonBuilder().setLabel('Instagram').setStyle(ButtonStyle.Link).setURL('https://instagram.com/revox_creatives')
    );
    return interaction.reply({ embeds: [e], components: [row] });
  }

  if (cmd === 'apply') return showModal(interaction);

  if (cmd === 'verify') {
    const role = interaction.guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);
    if (!role) return interaction.reply({ content: '❌ Verified role not configured.', ephemeral: true });
    const mem = interaction.guild.members.cache.get(interaction.user.id);
    if (mem.roles.cache.has(process.env.VERIFIED_ROLE_ID)) return interaction.reply({ content: '✅ Already verified!', ephemeral: true });
    await mem.roles.add(role);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(RED).setTitle('✅ Verified!').setDescription(`${interaction.user} you are now verified in **Revox Creatives**!`)] });
  }

  if (cmd === 'setrole') {
    const c = interaction.options.getString('role');
    const rid = c === 'creator' ? process.env.CREATOR_ROLE_ID : process.env.BRAND_ROLE_ID;
    const role = interaction.guild.roles.cache.get(rid);
    if (!role) return interaction.reply({ content: '❌ Role not configured.', ephemeral: true });
    await interaction.guild.members.cache.get(interaction.user.id).roles.add(role);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(RED).setDescription(`${c === 'creator' ? '🎮' : '🏷️'} **${c === 'creator' ? 'Creator' : 'Brand'}** role assigned!`)], ephemeral: true });
  }

  if (cmd === 'rules') {
    const e = new EmbedBuilder().setColor(RED).setTitle('📖 Revox Creatives Server Rules')
      .setDescription('Follow these rules to keep the community great for everyone.')
      .addFields(
        { name: '1️⃣ Respect Everyone',               value: 'No hate speech, harassment or toxic behaviour. Treat all members with respect.', inline: false },
        { name: '2️⃣ No Spam',                         value: 'No repeated messages, excessive caps or flooding any channel.', inline: false },
        { name: '3️⃣ Use Correct Channels',            value: 'Post content in the right channel. Gaming clips in #clips, questions in #help.', inline: false },
        { name: '4️⃣ No Unauthorised Self-Promotion',  value: 'Do not post your channel or socials without permission. Use #self-promo only.', inline: false },
        { name: '5️⃣ No Fake Agency Claims',           value: 'Only admins can speak on behalf of Revox Creatives. Do not impersonate the agency.', inline: false },
        { name: '6️⃣ No NSFW Content',                 value: 'Keep all content appropriate. This is a professional gaming community.', inline: false },
        { name: '7️⃣ English / Hindi Only',            value: 'Communicate in English or Hindi so everyone can participate.', inline: false },
        { name: '8️⃣ Respect Admin Decisions',         value: 'Admin decisions are final. DM an admin if you disagree — no public arguments.', inline: false },
        { name: '⚠️ Consequences',                    value: '**Warning → Mute → Kick → Ban**\nSerious violations = immediate ban.', inline: false },
      )
      .setFooter({ text: 'Revox Creatives • Last updated 2025' });
    return interaction.reply({ embeds: [e] });
  }

  if (cmd === 'announce') {
    const title   = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const type    = interaction.options.getString('type') || 'general';
    const labels  = { general:'📢 Announcement', event:'🎉 Event', brand:'🤝 Brand Deal', esports:'🏆 Esports', gaming:'🎮 Gaming Update' };
    const ch = interaction.guild.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID);
    if (!ch) return interaction.reply({ content: '❌ Announcements channel not set.', ephemeral: true });
    const e = new EmbedBuilder().setColor(RED).setAuthor({ name: `${labels[type]} — Revox Creatives` })
      .setTitle(title).setDescription(message).setTimestamp()
      .setFooter({ text: `Posted by ${interaction.user.tag}` });
    await ch.send({ content: '@everyone', embeds: [e] });
    return interaction.reply({ content: `✅ Announced in ${ch}!`, ephemeral: true });
  }

  if (cmd === 'help') {
    const e = new EmbedBuilder().setColor(RED).setTitle('REVOX BOT v2 — All Commands')
      .addFields(
        { name: '🔧 General',      value: '`/revox` `/apply` `/verify` `/setrole` `/ping` `/help`', inline: false },
        { name: '📖 Server',       value: '`/rules` `/announce` *(admin)*', inline: false },
        { name: '🏆 Tournaments',  value: '`/tourney create` `/tourney register` `/tourney list` `/tourney info` `/tourney cancel`', inline: false },
        { name: '💰 Economy',      value: '`/daily` `/balance` `/level` `/leaderboard` `/shop` `/rep` `/give` *(admin)*', inline: false },
      ).setFooter({ text: 'Revox Creatives • revoxcreatives.in' });
    return interaction.reply({ embeds: [e], ephemeral: true });
  }

  // TOURNAMENT
  if (cmd === 'tourney') {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
      const name = interaction.options.getString('name');
      const game = interaction.options.getString('game');
      const date = interaction.options.getString('date');
      const slots = interaction.options.getInteger('slots');
      const id = tid++;
      tourneys.set(id, { id, name, game, date, slots, registered: [], createdBy: interaction.user.tag });
      const e = new EmbedBuilder().setColor(RED).setTitle(`🏆 Tournament Created — #${id}`)
        .setDescription(`**${name}**`)
        .addFields(
          { name: '🎮 Game', value: game, inline: true },
          { name: '📅 Date', value: date, inline: true },
          { name: '👥 Slots', value: `0/${slots}`, inline: true },
          { name: '📋 How to Register', value: `\`/tourney register id:${id}\``, inline: false },
        ).setTimestamp().setFooter({ text: `Created by ${interaction.user.tag}` });
      const annCh = interaction.guild.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID);
      if (annCh) await annCh.send({ content: '@everyone 🏆 New tournament!', embeds: [e] });
      return interaction.reply({ embeds: [e] });
    }

    if (sub === 'register') {
      const id = interaction.options.getInteger('id');
      const t = tourneys.get(id);
      if (!t) return interaction.reply({ content: `❌ Tournament #${id} not found.`, ephemeral: true });
      if (t.registered.includes(interaction.user.id)) return interaction.reply({ content: '❌ Already registered!', ephemeral: true });
      if (t.registered.length >= t.slots) return interaction.reply({ content: '❌ Tournament full!', ephemeral: true });
      t.registered.push(interaction.user.id);
      addXP(interaction.user.id, 20);
      const e = new EmbedBuilder().setColor(GREEN).setTitle('✅ Registered!')
        .setDescription(`${interaction.user} you are registered for **${t.name}**!`)
        .addFields(
          { name: '🎮 Game', value: t.game, inline: true },
          { name: '📅 Date', value: t.date, inline: true },
          { name: '👥 Filled', value: `${t.registered.length}/${t.slots}`, inline: true },
        ).setFooter({ text: 'Good luck! 🔥' });
      return interaction.reply({ embeds: [e] });
    }

    if (sub === 'list') {
      if (tourneys.size === 0) return interaction.reply({ content: '📋 No active tournaments right now. Check back soon!', ephemeral: true });
      const e = new EmbedBuilder().setColor(RED).setTitle('🏆 Active Tournaments');
      tourneys.forEach(t => e.addFields({
        name: `#${t.id} — ${t.name}`,
        value: `🎮 ${t.game} | 📅 ${t.date} | 👥 ${t.registered.length}/${t.slots} slots\n\`/tourney register id:${t.id}\``,
        inline: false
      }));
      return interaction.reply({ embeds: [e] });
    }

    if (sub === 'info') {
      const id = interaction.options.getInteger('id');
      const t = tourneys.get(id);
      if (!t) return interaction.reply({ content: `❌ Tournament #${id} not found.`, ephemeral: true });
      const players = t.registered.map((uid, i) => `${i+1}. <@${uid}>`).join('\n') || 'No registrations yet';
      const e = new EmbedBuilder().setColor(RED).setTitle(`🏆 #${id} — ${t.name}`)
        .addFields(
          { name: '🎮 Game', value: t.game, inline: true },
          { name: '📅 Date', value: t.date, inline: true },
          { name: '👥 Slots', value: `${t.registered.length}/${t.slots}`, inline: true },
          { name: '📋 Players', value: players, inline: false },
        ).setFooter({ text: `Created by ${t.createdBy}` });
      return interaction.reply({ embeds: [e] });
    }

    if (sub === 'cancel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ content: '❌ Admins only.', ephemeral: true });
      const id = interaction.options.getInteger('id');
      if (!tourneys.has(id)) return interaction.reply({ content: `❌ Tournament #${id} not found.`, ephemeral: true });
      const name = tourneys.get(id).name;
      tourneys.delete(id);
      return interaction.reply({ content: `✅ Tournament **${name}** (#${id}) cancelled.` });
    }
  }

  // ECONOMY
  if (cmd === 'daily') {
    const u = getUser(interaction.user.id);
    const now = Date.now();
    if (u.lastDaily && now - u.lastDaily < 86400000) {
      const hrs = Math.ceil((86400000 - (now - u.lastDaily)) / 3600000);
      return interaction.reply({ content: `⏰ Already claimed today! Come back in **${hrs}h**.`, ephemeral: true });
    }
    const reward = Math.floor(Math.random() * 51) + 50;
    u.coins += reward;
    u.lastDaily = now;
    const levelled = addXP(interaction.user.id, 30);
    const e = new EmbedBuilder().setColor(GOLD).setTitle('💰 Daily Claimed!')
      .addFields(
        { name: '💰 Earned',  value: `+${reward} RX Coins`, inline: true },
        { name: '💳 Balance', value: `${u.coins} coins`, inline: true },
        { name: '⭐ XP',      value: '+30 XP', inline: true },
      ).setFooter({ text: levelled ? `🎉 LEVEL UP! Now Level ${u.level}!` : 'Come back tomorrow!' });
    return interaction.reply({ embeds: [e] });
  }

  if (cmd === 'balance') {
    const u = getUser(interaction.user.id);
    const e = new EmbedBuilder().setColor(GOLD).setTitle(`💳 ${interaction.user.username}'s Balance`)
      .addFields(
        { name: '💰 RX Coins', value: `${u.coins}`, inline: true },
        { name: '⭐ XP', value: `${u.xp}/${u.level * 100}`, inline: true },
        { name: '🏅 Level', value: `${u.level}`, inline: true },
        { name: '⭐ Rep', value: `${u.rep}`, inline: true },
      );
    return interaction.reply({ embeds: [e] });
  }

  if (cmd === 'level') {
    const u = getUser(interaction.user.id);
    const prog = Math.floor((u.xp / (u.level * 100)) * 20);
    const bar = '█'.repeat(prog) + '░'.repeat(20 - prog);
    const e = new EmbedBuilder().setColor(RED).setTitle(`🏅 ${interaction.user.username}'s Level`)
      .addFields(
        { name: 'Level', value: `${u.level}`, inline: true },
        { name: 'XP', value: `${u.xp}/${u.level * 100}`, inline: true },
        { name: 'Progress', value: `\`${bar}\``, inline: false },
      );
    return interaction.reply({ embeds: [e] });
  }

  if (cmd === 'leaderboard') {
    const sorted = [...economy.entries()].sort((a,b) => b[1].coins - a[1].coins).slice(0,10);
    if (!sorted.length) return interaction.reply({ content: 'No data yet! Use `/daily` to start.', ephemeral: true });
    const medals = ['🥇','🥈','🥉'];
    const desc = sorted.map(([uid,d],i) => `${medals[i]||`${i+1}.`} <@${uid}> — **${d.coins}** RX Coins`).join('\n');
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(GOLD).setTitle('🏆 RX Coins Leaderboard').setDescription(desc).setFooter({ text: 'Earn with /daily!' })] });
  }

  if (cmd === 'shop') {
    const e = new EmbedBuilder().setColor(RED).setTitle('🛒 RX Coins Shop')
      .setDescription('Spend your coins on exclusive perks! DM an admin to redeem.')
      .addFields(
        { name: '🎨 Custom Role Colour — 500 coins',  value: 'Get a custom colour on your Discord role.', inline: false },
        { name: '📌 Channel Pin — 200 coins',          value: 'Pin your message in any channel.', inline: false },
        { name: '🎮 Tournament Wildcard — 300 coins',  value: 'Enter a full tournament as wildcard.', inline: false },
        { name: '⭐ Shoutout — 400 coins',             value: 'Get shouted out in #announcements.', inline: false },
        { name: '👑 VIP Role — 1000 coins',            value: 'Get the exclusive VIP role permanently.', inline: false },
      ).setFooter({ text: 'DM an admin to redeem • Revox Creatives' });
    return interaction.reply({ embeds: [e] });
  }

  if (cmd === 'rep') {
    const target = interaction.options.getUser('user');
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ You cannot rep yourself!', ephemeral: true });
    const u = getUser(target.id);
    u.coins += 10; u.rep++;
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(GREEN).setDescription(`⭐ ${interaction.user} repped ${target}! They earned **+10 RX Coins**.`)] });
  }

  if (cmd === 'give') {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    if (amount <= 0) return interaction.reply({ content: '❌ Amount must be positive.', ephemeral: true });
    const u = getUser(target.id);
    u.coins += amount;
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(GREEN).setDescription(`✅ Gave **${amount} RX Coins** to ${target}. Balance: **${u.coins}**`)] });
  }
});

// ── APPLICATION MODAL ──
async function showModal(interaction) {
  const modal = new ModalBuilder().setCustomId('apply_modal').setTitle('Apply to Revox Creatives');
  modal.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Your Name').setStyle(TextInputStyle.Short).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('handle').setLabel('YouTube / Instagram Handle').setStyle(TextInputStyle.Short).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('game').setLabel('Main Game').setStyle(TextInputStyle.Short).setPlaceholder('BGMI / Valorant / Free Fire / Other').setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('followers').setLabel('Followers / Subscribers').setStyle(TextInputStyle.Short).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('goal').setLabel('Why do you want to join Revox?').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500))
  );
  await interaction.showModal(modal);
}

async function handleApp(interaction) {
  const name = interaction.fields.getTextInputValue('name');
  const handle = interaction.fields.getTextInputValue('handle');
  const game = interaction.fields.getTextInputValue('game');
  const followers = interaction.fields.getTextInputValue('followers');
  const goal = interaction.fields.getTextInputValue('goal');

  const appCh = interaction.guild.channels.cache.get(process.env.APPLICATIONS_CHANNEL_ID);
  if (appCh) {
    const e = new EmbedBuilder().setColor(RED).setTitle('🎮 New Creator Application')
      .addFields(
        { name: '👤 Name', value: name, inline: true },
        { name: '🎮 Game', value: game, inline: true },
        { name: '📊 Followers', value: followers, inline: true },
        { name: '🔗 Handle', value: handle, inline: false },
        { name: '💬 Why Revox?', value: goal, inline: false },
        { name: '📧 Discord', value: `${interaction.user.tag}`, inline: false },
      ).setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })).setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('✅ Accept').setStyle(ButtonStyle.Success).setCustomId(`accept_${interaction.user.id}`),
      new ButtonBuilder().setLabel('❌ Decline').setStyle(ButtonStyle.Danger).setCustomId(`decline_${interaction.user.id}`)
    );
    await appCh.send({ embeds: [e], components: [row] });
  }

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(RED).setTitle('✅ Application Received!')
    .setDescription(`Thanks **${name}**! We'll get back to you within **48 hours**.\n\n📧 info@revoxcreatives.in`)
    .setFooter({ text: 'Revox Creatives • Creating Winners Beyond The Game' })], ephemeral: true });
}

client.on('error', console.error);
process.on('unhandledRejection', e => console.error('Unhandled:', e));
client.login(process.env.BOT_TOKEN);
