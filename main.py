from street_easy_api import fetch_all_rentals, API_URL, RentalListing
from typing import List
import postgres
import telegram

# Search criteria configuration
AREA_NAME = "Greenpoint"  # Neighborhood name for display
AREA_CODE = 301  # Greenpoint area code
PRICE_MIN = None  # No minimum price
PRICE_MAX = 4000  # Maximum price
BEDROOMS_MIN = 2  # Minimum bedrooms
BEDROOMS_MAX = 3  # Maximum bedrooms
RESULTS_PER_PAGE = 500  # Number of results to fetch

# Bounding box for Greenpoint area
BOUNDING_BOX = {
    "topLeft": {
        "latitude": 40.746,
        "longitude": -73.98
    },
    "bottomRight": {
        "latitude": 40.711,
        "longitude": -73.914
    }
}


def print_new_listings(new_listings: List[RentalListing]):
    """Print formatted new rental listings."""
    for i, listing in enumerate(new_listings, 1):
        # Format bathrooms to show .5 but not .0
        bath_str = f"{listing['bathrooms']:.1f}".rstrip('0').rstrip('.')
        print(f"{i:3}. ${listing['price']:,}/mo | {listing['bedrooms']} bed {bath_str} bath | {listing['url']}")


# Main execution
if __name__ == "__main__":
    print(f"Starting rental search...")
    print(f"Criteria: {BEDROOMS_MIN}-{BEDROOMS_MAX} bedrooms, "
          f"max ${PRICE_MAX}/month in {AREA_NAME} (area {AREA_CODE})")
    print("-" * 80)

    # Create table if it doesn't exist
    postgres.create_table()

    # Get existing IDs from database
    existing_ids = postgres.get_all_ids()
    print(f"Found {len(existing_ids)} existing rentals in database")

    # Fetch ALL rental listings using pagination
    listings = fetch_all_rentals(
        api_url=API_URL,
        area_code=AREA_CODE,
        price_min=PRICE_MIN,
        price_max=PRICE_MAX,
        bedrooms_min=BEDROOMS_MIN,
        bedrooms_max=BEDROOMS_MAX,
        bounding_box=BOUNDING_BOX,
        results_per_page=RESULTS_PER_PAGE
    )

    # Filter to only new listings
    new_listings = [listing for listing in listings if listing['id'] not in existing_ids]

    print("\n" + "=" * 80)
    print(f"SUMMARY: Found {len(listings)} total listings")
    print(f"NEW LISTINGS: {len(new_listings)}")
    print("=" * 80)

    # Send new listings via Telegram and save to database
    if new_listings:
        print("\nNew rental listings:")
        print_new_listings(new_listings)

        # Send via Telegram
        telegram.send_new_listings(new_listings, AREA_NAME)

        # Write new listings to database
        postgres.write_listings(new_listings)
        print(f"\n✅ Saved {len(new_listings)} new listings to database")
    else:
        print("\nNo new listings found")
