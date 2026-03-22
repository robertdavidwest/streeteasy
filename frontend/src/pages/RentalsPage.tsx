import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { rentalsApi, favoritesApi, Rental, Favorite, ApiError } from '../services/api'
import { formatListingTitle } from '../utils/formatters'

export default function RentalsPage() {
  const { token, logout } = useAuth()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favoritingId, setFavoritingId] = useState<string | null>(null)

  // Filters
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [search, setSearch] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const limit = 20

  const loadRentals = async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const params = {
        skip: page * limit,
        limit,
        ...(minPrice && { min_price: parseInt(minPrice) }),
        ...(maxPrice && { max_price: parseInt(maxPrice) }),
        ...(bedrooms && { min_bedrooms: parseInt(bedrooms), max_bedrooms: parseInt(bedrooms) }),
        ...(search && { search }),
      }

      const data = await rentalsApi.list(token, params)
      setRentals(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load rentals')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    if (!token) return
    try {
      const data = await favoritesApi.list(token)
      setFavorites(data)
    } catch (err) {
      console.error('Failed to load favorites:', err)
    }
  }

  const isFavorited = (rentalId: string) => {
    return favorites.some((fav) => fav.rental_id === rentalId)
  }

  const getFavoriteId = (rentalId: string) => {
    return favorites.find((fav) => fav.rental_id === rentalId)?.id
  }

  const handleToggleFavorite = async (rental: Rental) => {
    if (!token) return

    const favorited = isFavorited(rental.id)
    setFavoritingId(rental.id)

    try {
      if (favorited) {
        const favoriteId = getFavoriteId(rental.id)
        if (favoriteId) {
          await favoritesApi.delete(token, favoriteId)
          setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
        }
      } else {
        const newFavorite = await favoritesApi.create(token, rental.id)
        setFavorites((prev) => [...prev, newFavorite])
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to update favorite')
      }
    } finally {
      setFavoritingId(null)
    }
  }

  useEffect(() => {
    loadRentals()
    loadFavorites()
  }, [page])

  const handleApplyFilters = () => {
    setPage(0)
    loadRentals()
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('')
    setSearch('')
    setPage(0)
    setTimeout(loadRentals, 0)
  }

  return (
    <div>
      {/* Navigation Bar */}
      <div
        style={{
          backgroundColor: '#007bff',
          padding: '15px 30px',
          color: 'white',
          marginBottom: '30px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>StreetEasyAndMe</h1>
            <nav style={{ display: 'flex', gap: '20px' }}>
              <Link
                to="/"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  opacity: 0.8,
                }}
              >
                My Listings
              </Link>
              <Link
                to="/rentals"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  borderBottom: '2px solid white',
                  paddingBottom: '4px',
                }}
              >
                Browse Rentals
              </Link>
            </nav>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

      {/* Filters */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Filters</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Search Address</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. mcguinness, brooklyn, etc."
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="e.g. 2000"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 4000"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Bedrooms</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Any</option>
              <option value="0">Studio</option>
              <option value="1">1 BR</option>
              <option value="2">2 BR</option>
              <option value="3">3 BR</option>
              <option value="4">4+ BR</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleApplyFilters} style={{ padding: '8px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Apply Filters
          </button>
          <button onClick={handleClearFilters} style={{ padding: '8px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading rentals...</div>
      ) : rentals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#6c757d' }}>
          No rentals found matching your filters.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px', color: '#6c757d' }}>
            Showing {rentals.length} rental{rentals.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {rentals.map((rental) => (
              <div key={rental.id} style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                  {rental.image_url && (
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={rental.image_url}
                        alt={formatListingTitle(rental.url)}
                        style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                      {formatListingTitle(rental.url)}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
                      {rental.bedrooms === 0 ? 'Studio' : `${rental.bedrooms} Bedroom${rental.bedrooms > 1 ? 's' : ''}`}
                      {' • '}
                      {rental.bathrooms} Bath{rental.bathrooms !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
                      ${rental.price.toLocaleString()}/mo
                    </div>
                    <a href={rental.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                      View on StreetEasy →
                    </a>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <button
                      onClick={() => handleToggleFavorite(rental)}
                      disabled={favoritingId === rental.id}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: isFavorited(rental.id) ? '#28a745' : '#ffc107',
                        color: isFavorited(rental.id) ? 'white' : '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: favoritingId === rental.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        opacity: favoritingId === rental.id ? 0.6 : 1,
                      }}
                    >
                      {favoritingId === rental.id
                        ? '...'
                        : isFavorited(rental.id)
                        ? '✓ Favorited'
                        : '★ Favorite'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ padding: '8px 16px', backgroundColor: page === 0 ? '#e9ecef' : '#007bff', color: page === 0 ? '#6c757d' : 'white', border: 'none', borderRadius: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={rentals.length < limit}
              style={{ padding: '8px 16px', backgroundColor: rentals.length < limit ? '#e9ecef' : '#007bff', color: rentals.length < limit ? '#6c757d' : 'white', border: 'none', borderRadius: '4px', cursor: rentals.length < limit ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
