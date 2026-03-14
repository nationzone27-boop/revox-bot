# REVOX CREATIVES — Discord Bot Setup Guide

## STEP 1 — Create the Bot on Discord

1. Go to https://discord.com/developers/applications
2. Click **New Application** → name it `Revox Creatives`
3. Go to **Bot** tab → click **Add Bot**
4. Under **Privileged Gateway Intents**, enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Click **Reset Token** → copy your token (save it — you need it later)
6. Go to **OAuth2 → URL Generator**
   - Scopes: ✅ `bot` + ✅ `applications.commands`
   - Bot Permissions: ✅ Administrator
7. Copy the generated URL → open it → add bot to your server

---

## STEP 2 — Set Up Your Discord Server

Create these channels in your server:
- `#welcome` — where welcome messages appear
- `#applications` — where creator applications land (admin only)
- `#announcements` — for bot announcements
- `#bot-logs` — for logs (optional)

Create these roles:
- `Member` — auto-assigned on join
- `Creator` — for gaming creators
- `Brand` — for brand partners
- `Verified` — for verified members
- `Admin` — for admins

---

## STEP 3 — Get Your IDs

Enable Developer Mode in Discord:
Settings → Advanced → Developer Mode → ON

Then right-click each channel/role → **Copy ID**

You need:
- Server (Guild) ID
- #welcome channel ID
- #applications channel ID
- #announcements channel ID
- #bot-logs channel ID
- Member role ID
- Creator role ID
- Brand role ID
- Verified role ID
- Admin role ID

---

## STEP 4 — Deploy on Railway (FREE)

1. Go to https://railway.app → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Upload this folder to a new GitHub repo first:
   - Go to https://github.com/new
   - Create repo called `revox-bot`
   - Upload all files
4. Back in Railway → select your repo → Deploy

### Add Environment Variables in Railway:
In your Railway project → **Variables** tab → add each one:

```
BOT_TOKEN              = (your bot token from Step 1)
GUILD_ID               = (your server ID)
WELCOME_CHANNEL_ID     = (your #welcome channel ID)
APPLICATIONS_CHANNEL_ID = (your #applications channel ID)
ANNOUNCEMENTS_CHANNEL_ID = (your #announcements channel ID)
LOGS_CHANNEL_ID        = (your #bot-logs channel ID)
CREATOR_ROLE_ID        = (Creator role ID)
BRAND_ROLE_ID          = (Brand role ID)
MEMBER_ROLE_ID         = (Member role ID)
VERIFIED_ROLE_ID       = (Verified role ID)
ADMIN_ROLE_ID          = (Admin role ID)
```

5. Railway will auto-deploy → bot goes online! 🟢

---

## BOT COMMANDS

| Command | What it does | Who can use |
|---------|-------------|-------------|
| `/revox` | Shows agency info + links | Everyone |
| `/apply` | Opens creator application form | Everyone |
| `/verify` | Get the Verified role | Everyone |
| `/setrole` | Set yourself as Creator or Brand | Everyone |
| `/announce` | Post a branded announcement | Admins only |
| `/ping` | Check bot is alive | Everyone |
| `/help` | Show all commands | Everyone |

---

## NEED HELP?

Email: info@revoxcreatives.in
Instagram: @revox_creatives
