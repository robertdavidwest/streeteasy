from street_easy_api import fetch_all_rentals, API_URL

# Search criteria configuration
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

# Main execution
if __name__ == "__main__":
    print(f"Starting rental search...")
    print(f"Criteria: {BEDROOMS_MIN}-{BEDROOMS_MAX} bedrooms, "
          f"max ${PRICE_MAX}/month in area {AREA_CODE}")
    print("-" * 80)

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

    print("\n" + "=" * 80)
    print(f"SUMMARY: Found {len(listings)} total listings")
    print("=" * 80)

    # Display listing URLs (simple output for testing)
    print("\nListing URLs:")
    for i, listing in enumerate(listings, 1):
        print(f"{i:3}. {listing['id']} - {listing['url']}")


