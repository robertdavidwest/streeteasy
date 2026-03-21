/**
 * Transform a StreetEasy URL into a readable listing title.
 *
 * Example:
 * https://streeteasy.com/building/99-mc-guinness-blvd-brooklyn/1
 * → "99 Mc Guinness Boulevard #1"
 */
export function formatListingTitle(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    // Expected format: /building/{address-neighborhood}/{unit}
    if (pathParts.length < 2 || pathParts[0] !== 'building') {
      return 'Listing'
    }

    const addressPart = pathParts[1]
    const unitNumber = pathParts[2]

    // Split address by hyphens and remove neighborhood (last part)
    const parts = addressPart.split('-')
    const addressParts = parts.slice(0, -1) // Remove neighborhood (e.g., 'brooklyn')

    // Capitalize each word and handle abbreviations
    const formatted = addressParts.map((part) => {
      // Handle common abbreviations
      const abbrevMap: Record<string, string> = {
        'st': 'Street',
        'ave': 'Avenue',
        'blvd': 'Boulevard',
        'rd': 'Road',
        'dr': 'Drive',
        'ln': 'Lane',
        'ct': 'Court',
        'pl': 'Place',
        'pkwy': 'Parkway',
        'n': 'North',
        's': 'South',
        'e': 'East',
        'w': 'West',
      }

      const lower = part.toLowerCase()
      if (abbrevMap[lower]) {
        return abbrevMap[lower]
      }

      // Capitalize first letter of each word
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    }).join(' ')

    // Add unit number if present
    if (unitNumber) {
      return `${formatted} #${unitNumber}`
    }

    return formatted
  } catch (error) {
    return 'Listing'
  }
}
