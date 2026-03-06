"""
StreetEasy API helper constants and utilities.
"""

# GraphQL API endpoint
API_URL = "https://api-v6.streeteasy.com/"

# GraphQL query for rental listings
RENTAL_QUERY = """
  query GetListingRental($input: SearchRentalsInput!) {
    searchRentals(input: $input) {
      search {
        criteria
      }
      totalCount
      edges {
        ... on OrganicRentalEdge {
          node {
            id
            areaName
            bedroomCount
            buildingType
            fullBathroomCount
            geoPoint {
              latitude
              longitude
            }
            halfBathroomCount
            leadMedia {
              photo {
                  key
              }
            }
            price
            relloExpress {
              ctaEnabled
              link
              rentalId
            }
            sourceGroupLabel
            status
            street
            unit
            urlPath
            tier
          }
        }
      }
    }
  }
"""

# Request headers for StreetEasy API
API_HEADERS = {
    'accept': 'application/json',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.7',
    'apollographql-client-name': 'srp-frontend-service',
    'apollographql-client-version': 'version b003f804072b2a80b1add10aea7d0836bd970c39',
    'app-version': '1.0.0',
    'authorization': '92h9tnyyLmkToa7HhksceQ',
    'content-type': 'application/json',
    'origin': 'https://streeteasy.com',
    'os': 'web',
    'referer': 'https://streeteasy.com/',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Brave";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'x-forwarded-proto': 'https'
}