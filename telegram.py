"""
Telegram bot functionality for sending rental listings.
"""
import os
import requests
from typing import List, Optional

from street_easy_api import RentalListing


def send_telegram_message(message: str) -> bool:
    """
    Send a message via Telegram bot to multiple chat IDs.

    Args:
        message: The message text to send

    Returns:
        True if message was sent successfully, False otherwise
    """
    bot_token = os.environ['TELEGRAM_BOT_TOKEN']

    # Support both TELEGRAM_CHAT_IDS (multiple) and TELEGRAM_CHAT_ID (single) for backward compatibility
    if 'TELEGRAM_CHAT_IDS' in os.environ:
        chat_ids = os.environ['TELEGRAM_CHAT_IDS'].split(',')
    else:
        chat_ids = [os.environ['TELEGRAM_CHAT_ID']]

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    for chat_id in chat_ids:
        payload = {
            'chat_id': chat_id.strip(),
            'text': message,
            'parse_mode': 'HTML',
            'disable_web_page_preview': True
        }

        response = requests.post(url, json=payload)
        response.raise_for_status()

    return True


def send_new_listings(new_listings: List[RentalListing], neighborhood: str = "", max_price: Optional[int] = None,
                     bedrooms_min: Optional[int] = None, bedrooms_max: Optional[int] = None):
    """
    Send new rental listings via Telegram.

    Args:
        new_listings: List of new rental listings to send
        neighborhood: Name of the neighborhood for context
        max_price: Maximum price filter used in search
        bedrooms_min: Minimum bedrooms in search
        bedrooms_max: Maximum bedrooms in search
    """
    if not new_listings:
        return

    # Build message header
    location = f" in {neighborhood}" if neighborhood else ""
    price_filter = f" under ${max_price:,}" if max_price else ""

    # Format bedroom range
    if bedrooms_min and bedrooms_max:
        if bedrooms_min == bedrooms_max:
            bedroom_filter = f" ({bedrooms_min} bed)"
        else:
            bedroom_filter = f" ({bedrooms_min}-{bedrooms_max} bed)"
    else:
        bedroom_filter = ""

    message = f"<b>🏠 {len(new_listings)} New Rental Listing{'s' if len(new_listings) > 1 else ''}{location}{price_filter}{bedroom_filter}</b>\n\n"

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
