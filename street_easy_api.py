"""
StreetEasy API functions for fetching rental listings.
"""
import requests
from typing import Optional, Dict, Any, List, TypedDict

from street_easy_config import API_URL, RENTAL_QUERY, API_HEADERS

# Re-export API_URL for convenience
__all__ = ['API_URL', 'RentalListing', 'fetch_all_rentals', 'fetch_rentals',
           'process_rental_response', 'extract_listing_data']


class RentalListing(TypedDict, total=False):
    """Data structure for a rental listing."""
    # Required fields for now
    id: str
    url: str

    # Available fields from API (commented out for future use)
    # street: str
    # unit: str
    # price: int
    # bedroom_count: int
    # full_bathroom_count: int
    # half_bathroom_count: int
    # area_name: str
    # building_type: str
    # status: str
    # source_group_label: str
    # tier: str
    # latitude: Optional[float]
    # longitude: Optional[float]
    # photo_key: Optional[str]
    # rello_express_enabled: Optional[bool]
    # rello_express_link: Optional[str]
    # rello_express_rental_id: Optional[str]


def extract_listing_data(node: Dict[str, Any]) -> RentalListing:
    """
    Extract relevant data from a rental node.

    Args:
        node: The node data from the API response

    Returns:
        RentalListing with extracted data
    """
    listing: RentalListing = {}

    # Extract ID (required field - will raise KeyError if missing)
    listing['id'] = node['id']

    # Build the full URL (required field - will raise KeyError if missing)
    listing['url'] = f"https://streeteasy.com{node['urlPath']}"

    # Uncomment to extract additional fields as needed:
    # listing['street'] = node.get('street')
    # listing['unit'] = node.get('unit')
    # listing['price'] = node.get('price')
    # listing['bedroom_count'] = node.get('bedroomCount')
    # listing['full_bathroom_count'] = node.get('fullBathroomCount')
    # listing['half_bathroom_count'] = node.get('halfBathroomCount')
    # listing['area_name'] = node.get('areaName')
    # listing['building_type'] = node.get('buildingType')
    # listing['status'] = node.get('status')
    # listing['source_group_label'] = node.get('sourceGroupLabel')
    # listing['tier'] = node.get('tier')

    # # Geographic data
    # geo_point = node.get('geoPoint', {})
    # if geo_point:
    #     listing['latitude'] = geo_point.get('latitude')
    #     listing['longitude'] = geo_point.get('longitude')

    # # Lead media/photo
    # lead_media = node.get('leadMedia', {})
    # if lead_media and 'photo' in lead_media:
    #     listing['photo_key'] = lead_media['photo'].get('key')

    # # Rello Express data
    # rello = node.get('relloExpress', {})
    # if rello:
    #     listing['rello_express_enabled'] = rello.get('ctaEnabled')
    #     listing['rello_express_link'] = rello.get('link')
    #     listing['rello_express_rental_id'] = rello.get('rentalId')

    return listing


def fetch_rentals(
    api_url: str,
    area_code: int,
    price_min: Optional[int],
    price_max: Optional[int],
    bedrooms_min: int,
    bedrooms_max: int,
    bounding_box: Dict[str, Dict[str, float]],
    results_per_page: int = 500,
    page: int = 1
) -> Dict[str, Any]:
    """
    Fetch rental listings from StreetEasy API.

    Args:
        api_url: The StreetEasy GraphQL API endpoint
        area_code: Area/neighborhood code (e.g., 301 for Greenpoint)
        price_min: Minimum monthly rent (None for no minimum)
        price_max: Maximum monthly rent (None for no maximum)
        bedrooms_min: Minimum number of bedrooms
        bedrooms_max: Maximum number of bedrooms
        bounding_box: Geographic bounds with topLeft and bottomRight coords
        results_per_page: Number of results to fetch per page
        page: Page number for pagination

    Returns:
        Dict containing the API response data

    Raises:
        requests.HTTPError: If the API returns a non-200 status code
        requests.RequestException: For other request-related errors
    """

    # Query variables
    variables = {
        "input": {
            "filters": {
                "rentalStatus": "ACTIVE",
                "areas": [area_code],
                "price": {
                    "lowerBound": price_min,
                    "upperBound": price_max
                },
                "bedrooms": {
                    "lowerBound": bedrooms_min,
                    "upperBound": bedrooms_max
                },
                "boundingBox": bounding_box
            },
            "page": page,
            "perPage": results_per_page,
            "sorting": {
                "attribute": "RECOMMENDED",
                "direction": "DESCENDING"
            },
            "userSearchToken": "48bc2766-8755-4e79-b3f3-bc02cf76beab",
            "adStrategy": "NONE"
        }
    }

    # Payload for the GraphQL request
    payload = {
        "query": RENTAL_QUERY,
        "variables": variables
    }

    try:
        # Make the API request
        response = requests.post(api_url, headers=API_HEADERS, json=payload)
        response.raise_for_status()  # Raises HTTPError for bad status codes

        return response.json()

    except requests.HTTPError as e:
        raise requests.HTTPError(
                f"API returned status {response.status_code}: {response.text}") from e
    except requests.RequestException as e:
        raise requests.RequestException(f"Request failed: {str(e)}") from e


def process_rental_response(response_data: Dict[str, Any]) -> List[RentalListing]:
    """
    Process the API response and extract rental listings.

    Args:
        response_data: The full API response

    Returns:
        List of RentalListing objects
    """
    rentals = response_data['data']['searchRentals']
    return [extract_listing_data(edge['node']) for edge in rentals['edges']]


def fetch_all_rentals(
    api_url: str,
    area_code: int,
    price_min: Optional[int],
    price_max: Optional[int],
    bedrooms_min: int,
    bedrooms_max: int,
    bounding_box: Dict[str, Dict[str, float]],
    results_per_page: int = 500
) -> List[RentalListing]:
    """
    Fetch all rental listings using pagination.

    Args:
        api_url: The StreetEasy GraphQL API endpoint
        area_code: Area/neighborhood code
        price_min: Minimum monthly rent
        price_max: Maximum monthly rent
        bedrooms_min: Minimum number of bedrooms
        bedrooms_max: Maximum number of bedrooms
        bounding_box: Geographic bounds
        results_per_page: Number of results per page

    Returns:
        List of all RentalListing objects across all pages
    """
    all_listings: List[RentalListing] = []
    page = 1
    total_count = None

    while True:
        print(f"Fetching page {page}...")

        # Fetch current page
        response_data = fetch_rentals(
            api_url=api_url,
            area_code=area_code,
            price_min=price_min,
            price_max=price_max,
            bedrooms_min=bedrooms_min,
            bedrooms_max=bedrooms_max,
            bounding_box=bounding_box,
            results_per_page=results_per_page,
            page=page
        )

        # Process response and extract listings
        page_listings = process_rental_response(response_data)
        all_listings.extend(page_listings)

        # Get total count on first page
        if total_count is None:
            total_count = response_data['data']['searchRentals']['totalCount']
            print(f"Total rentals available: {total_count}")

        # Check if we've fetched all results
        if not page_listings:  # No more results on this page
            print(f"No more listings found on page {page}")
            break

        # Check if we've reached the total count
        if total_count and len(all_listings) >= total_count:
            print(f"Fetched all {total_count} listings")
            break

        # Check if we got less than a full page (indicates last page)
        if len(page_listings) < results_per_page:
            print(f"Last page reached (got {len(page_listings)} listings)")
            break

        page += 1

        # Safety limit to prevent infinite loops
        if page > 20:  # Max 10,000 listings (500 * 20)
            print(f"Reached maximum page limit ({page - 1} pages)")
            break

    print(f"✅ Fetched {len(all_listings)} total listings across {page} page(s)")
    return all_listings