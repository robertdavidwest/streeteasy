from street_easy_api import fetch_all_rentals, API_URL, RentalListing
from typing import List
import postgres
import telegram

# Search configuration - simplified to a single config with lists
SEARCH_CONFIG = {
    # Area codes from StreetEasy:
    # 301 = Greenpoint
    # 302 = Williamsburg (includes East Williamsburg)
    "area_codes": [301, 302],  # Search Greenpoint and Williamsburg
    "price_min": None,
    "price_max": 5500,
    "bedrooms_min": 2,
    "bedrooms_max": 3,
    "bounding_box": None  # Optional - can be None or specify coordinates
}

RESULTS_PER_PAGE = 500  # Number of results to fetch per page


def print_new_listings(new_listings: List[RentalListing]):
    """Print formatted new rental listings."""
    for i, listing in enumerate(new_listings, 1):
        # Format bathrooms to show .5 but not .0
        bath_str = f"{listing['bathrooms']:.1f}".rstrip('0').rstrip('.')
        print(f"{i:3}. ${listing['price']:,}/mo | {listing['bedrooms']} bed {bath_str} bath | {listing['url']}")


# Main execution
if __name__ == "__main__":
    areas_str = ", ".join(str(code) for code in SEARCH_CONFIG["area_codes"])
    print(f"Starting rental search for area codes: {areas_str}")
    print(f"Criteria: {SEARCH_CONFIG['bedrooms_min']}-{SEARCH_CONFIG['bedrooms_max']} bedrooms, "
          f"max ${SEARCH_CONFIG['price_max']}/month")
    print("=" * 80)

    # Create table if it doesn't exist
    postgres.create_table()

    # Get existing IDs from database
    existing_ids = postgres.get_all_ids()
    is_first_run = len(existing_ids) == 0
    print(f"Found {len(existing_ids)} existing rentals in database")

    # Fetch ALL rental listings using pagination
    listings = fetch_all_rentals(
        api_url=API_URL,
        area_codes=SEARCH_CONFIG["area_codes"],
        price_min=SEARCH_CONFIG["price_min"],
        price_max=SEARCH_CONFIG["price_max"],
        bedrooms_min=SEARCH_CONFIG["bedrooms_min"],
        bedrooms_max=SEARCH_CONFIG["bedrooms_max"],
        bounding_box=SEARCH_CONFIG["bounding_box"],
        results_per_page=RESULTS_PER_PAGE
    )

    # Filter to only new listings
    new_listings = [listing for listing in listings if listing['id'] not in existing_ids]

    # Summary
    print("\n" + "=" * 80)
    print(f"SUMMARY: Found {len(listings)} total listings")
    print(f"NEW LISTINGS: {len(new_listings)}")
    print("=" * 80)

    if new_listings:
        # Group new listings by area for display
        listings_by_area = {}
        for listing in new_listings:
            area = listing.get('area_name', 'Unknown')
            if area not in listings_by_area:
                listings_by_area[area] = []
            listings_by_area[area].append(listing)

        print("\nNew rental listings by area:")
        for area_name, area_listings in listings_by_area.items():
            print(f"\n{area_name} ({len(area_listings)} new):")
            print_new_listings(area_listings)

        # Only send via Telegram if this isn't the first run
        if not is_first_run:
            # Send notifications grouped by area
            for area_name, area_listings in listings_by_area.items():
                telegram.send_new_listings(
                    area_listings,
                    area_name,
                    SEARCH_CONFIG['price_max'],
                    SEARCH_CONFIG['bedrooms_min'],
                    SEARCH_CONFIG['bedrooms_max']
                )
                pass
            print("✅ Sent notifications via Telegram")
        else:
            print("📝 First run - skipping Telegram notifications")

        # Write new listings to database (with area_name included)
        postgres.write_listings(new_listings)
        print(f"\n✅ Saved {len(new_listings)} new listings to database")
    else:
        print("\nNo new listings found")
