"""
Telegram bot functionality for sending rental listings.
"""
import os
import requests
from typing import List

from street_easy_api import RentalListing


def send_telegram_message(message: str) -> bool:
    """
    Send a message via Telegram bot.

    Args:
        message: The message text to send

    Returns:
        True if message was sent successfully, False otherwise
    """
    bot_token = os.environ['TELEGRAM_BOT_TOKEN']
    chat_id = os.environ['TELEGRAM_CHAT_ID']

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'HTML',
        'disable_web_page_preview': True
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()
    return True


def send_new_listings(new_listings: List[RentalListing]):
    """
    Send new rental listings via Telegram.

    Args:
        new_listings: List of new rental listings to send
    """
    if not new_listings:
        return

    # Build message header
    message = f"<b>🏠 {len(new_listings)} New Rental Listing{'s' if len(new_listings) > 1 else ''}</b>\n\n"

    # Add each listing
    for i, listing in enumerate(new_listings, 1):
        # Format bathrooms to show .5 but not .0
        bath_str = f"{listing['bathrooms']:.1f}".rstrip('0').rstrip('.')

        # Format listing info
        message += f"{i}. <b>${listing['price']:,}/mo</b> | {listing['bedrooms']} bed {bath_str} bath\n"
        message += f"   {listing['url']}\n\n"

    send_telegram_message(message)


def test_telegram_connection():
    """Test if Telegram bot is properly configured."""
    send_telegram_message("✅ Telegram bot connected successfully!")