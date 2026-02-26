# InstaGhost - Instagram Bot Follower Remover

A browser-based tool that identifies and removes bot/spam followers from your Instagram account. It detects followers you don't follow back, scores them based on bot-likelihood signals, and removes them automatically while respecting Instagram's rate limits.

![UI Version](https://img.shields.io/badge/version-3.0-blue)
![Language](https://img.shields.io/badge/language-JavaScript-yellow)
![Platform](https://img.shields.io/badge/platform-Browser%20Console-green)

---

## Features

### Bot Detection & Scoring
- **Smart Bot Score** (0-11 scale) — accounts are scored based on multiple signals:
  - No profile picture (+4)
  - Numeric/gibberish username (+3)
  - Empty display name (+2)
  - Display name matches username (+1)
  - Excessive underscores/dots in username (+1)
  - Private account (+1)
  - Verified account (-10)
- Color-coded scores: Green (0-2 Low), Yellow (3-5 Medium), Red (6+ High)
- Removal queue sorted by score — highest-probability bots are removed first

### Concurrent Architecture
- Fetches followers and removes bots **simultaneously** — doesn't wait for the full list before starting removal
- Scan and removal run as independent async workers via `Promise.all`

### Rate Limit Safety
- Randomized delays between removals (26-44 seconds)
- Batch pauses: every 18 removals → 3-5.5 minute break
- Mega batch pauses: every 55 removals → 10-15 minute break
- Exponential backoff on 429 responses (10 min → doubled → max 60 min cap)
- Consecutive error detection with automatic cooldown
- **Designed to run unattended** — leave your computer on and walk away

### Full UI Panel
- Draggable floating panel with dark theme
- 5 tabs: **Dashboard**, **Bot List**, **Log**, **Whitelist**, **Settings**
- Real-time stats: following count, scanned followers, bots found, removed, queued, failed
- Progress bar with percentage, speed (removals/hour), and ETA
- Minimizable panel that stays out of the way

### Whitelist
- Protect specific accounts from ever being removed
- Add by username directly in the UI
- Import/export whitelist as JSON for backup
- Whitelisted accounts are automatically skipped during removal

### Bulk Selection
- Checkboxes on each bot entry for manual selection
- Select All / Deselect All buttons
- "Remove Selected" to target specific accounts
- Filter views: All, No Profile Picture, High Score, Selected

### Filters & Search
- Search bots by username or display name
- Filter by: no profile picture, high bot score, selected items
- Profile picture indicator icon on accounts with default/missing avatars

### Smart Pause
- Pause button **only pauses scanning** — removal continues from the existing queue
- Stop button halts everything and saves state

### Persistence & Resume
- Full state saved to `localStorage` — survives page refreshes
- Resume from where you left off after closing the tab
- Cursor-based pagination state preserved for followers fetch

### Bilingual Interface
- Turkish (TR) and English (EN) language support
- Instant switch from the UI — no reload needed
- 90+ localized strings covering all UI elements

### Configurable Settings
- Fetch speed (min/max delay, items per page)
- Remove speed (min/max delay between removals)
- Batch size and pause duration
- Mega batch size and pause duration
- Reset button to clear all saved data

### Export
- Download detailed JSON reports with:
  - Following count, scanned count, bots found
  - Full removed list with timestamps
  - Failed list with error codes
  - Remaining queue count

---

## Usage

1. Open [instagram.com](https://www.instagram.com) and log in to your account
2. Open browser DevTools (`F12` or `Ctrl+Shift+I`)
3. Go to the **Console** tab
4. Copy the entire contents of `bot_delete.js` and paste it into the console
5. Press **Enter** — the Bot Cleaner panel will appear
6. Click **START** and let it run

> **Tip:** You can minimize the panel and continue browsing. The tool runs in the background.

---

## How It Works

```
1. Fetches your Following list via Instagram's private API
2. Fetches your Followers list (paginated, cursor-based)
3. Compares: followers NOT in your following list = potential bots
4. Scores each bot based on profile signals
5. Queues bots sorted by score (highest first)
6. Removes bots via Instagram's remove_follower API
7. Steps 2-6 run concurrently — removal starts immediately
```

---

## Rate Limit Strategy

| Event | Action |
|-------|--------|
| Normal removal | 26-44s random delay |
| Every 18 removals | 3-5.5 min batch pause |
| Every 55 removals | 10-15 min mega pause |
| HTTP 429 response | Exponential backoff (10min → 20min → 40min → max 60min) |
| 8 consecutive errors | 15 min emergency cooldown |
| HTTP 401/403 | CSRF refresh + retry |

Estimated throughput: **~80-100 removals/hour**

---

## Screenshots

The tool injects a floating panel directly into the Instagram page:

- **Dashboard** — Live stats, progress bar, speed/ETA, control buttons
- **Bot List** — Scrollable list with avatars, bot scores, status badges, checkboxes
- **Log** — Timestamped event log with color-coded severity
- **Whitelist** — Protected accounts management with import/export
- **Settings** — All timing parameters configurable in real-time

---

## Bot Score Breakdown

| Signal | Points | Rationale |
|--------|--------|-----------|
| No profile picture | +4 | Strongest bot indicator |
| Numeric username (50%+ digits) | +3 | Auto-generated account pattern |
| Empty display name | +2 | Minimal profile effort |
| Display name = username | +1 | No personalization |
| 3+ consecutive underscores/dots | +1 | Generated username pattern |
| Private account | +1 | Common for spam accounts |
| Verified account | -10 | Extremely unlikely to be a bot |

---

## Disclaimer

This tool interacts with Instagram's private API. Use it at your own risk. Excessive or aggressive usage may result in temporary action blocks or account restrictions. The default rate limit settings are conservative and designed to minimize risk, but Instagram may change their limits at any time.

This tool is intended for personal use to clean your own account. Do not use it to harass or mass-remove legitimate followers.

---

## License

MIT
