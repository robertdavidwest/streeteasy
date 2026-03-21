# StreetEasy Rental Tracker

Tracks new rental listings in NYC via StreetEasy's API and sends notifications via Telegram.

## Setup

### 1. Install Dependencies

```bash
pip install requests psycopg2-binary
```

### 2. Set Up PostgreSQL

```bash
# Create database
psql -d postgres -c "CREATE DATABASE streeteasy;"

# The table will be created automatically on first run
```

### 3. Set Up Telegram Bot

#### Create a Bot:
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name for your bot (e.g., "StreetEasy Tracker")
4. Choose a username ending in `bot` (e.g., `my_streeteasy_bot`)
5. Save the token you receive (looks like `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

#### Get Your Chat ID(s):
1. Start a chat with your new bot (search for its username)
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Find the `"chat":{"id":` number (e.g., `123456789`)

Alternative: Search for `@userinfobot` on Telegram, start a chat, and it will show your ID.

**For multiple recipients:** Have each person message your bot, collect their chat IDs, and add them comma-separated to `TELEGRAM_CHAT_IDS`.

### 4. Configure Environment Variables

```bash
export DATABASE_URL="postgresql://username@localhost:5432/streeteasy"
export TELEGRAM_BOT_TOKEN="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"

# For multiple recipients (comma-separated):
export TELEGRAM_CHAT_IDS="123456789,987654321"

# Or for single recipient (backward compatible):
export TELEGRAM_CHAT_ID="123456789"
```

### 5. Customize Search Criteria

Edit `main.py` to adjust your search preferences:

```python
AREA_NAME = "Greenpoint"  # Neighborhood name for display
AREA_CODE = 301           # Neighborhood code
PRICE_MAX = 4000          # Maximum rent
BEDROOMS_MIN = 2          # Minimum bedrooms
BEDROOMS_MAX = 3          # Maximum bedrooms
```

## Usage

```bash
python main.py
```

The script will:
1. Fetch all listings matching your criteria
2. Compare against previously seen listings in the database
3. Send new listings to Telegram
4. Store new listings in PostgreSQL

## Files

- `main.py` - Main script with search configuration
- `street_easy_api.py` - API functions for fetching listings
- `street_easy_config.py` - API endpoint and headers
- `postgres.py` - Database operations
- `telegram.py` - Telegram notifications

## Scheduling

Schedule where you like. I deploy on render.com with a cron job
