import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import SearchContextBar from '../components/SearchContextBar'
import { rentalsApi, favoritesApi, Rental, Favorite, ApiError } from '../services/api'
import { formatListingTitle } from '../utils/formatters'

export default function RentalsPage() {
  const { token, logout } = useAuth()
  const { currentSearchId, currentSearch } = useSearch()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favoritingId, setFavoritingId] = useState<string | null>(null)
  const [availableAreas, setAvailableAreas] = useState<string[]>([])

  // Filters
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [search, setSearch] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

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
        ...(selectedAreas.length > 0 && { areas: selectedAreas }),
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
    if (!token || !currentSearchId) return
    try {
      const data = await favoritesApi.list(token, currentSearchId)
      setFavorites(data)
    } catch (err) {
      console.error('Failed to load favorites:', err)
    }
  }

  const loadAreas = async () => {
    if (!token) return
    try {
      const areas = await rentalsApi.getAreas(token)
      setAvailableAreas(areas)
    } catch (err) {
      console.error('Failed to load areas:', err)
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
        if (!currentSearchId) {
          setError('Please select a search first')
          return
        }
        const newFavorite = await favoritesApi.create(token, rental.id, currentSearchId)
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

  useEffect(() => {
    loadAreas()
  }, [])

  // Reload favorites when search changes
  useEffect(() => {
    if (currentSearchId) {
      loadFavorites()
    }
  }, [currentSearchId])

  const handleApplyFilters = () => {
    setPage(0)
    loadRentals()
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('')
    setSearch('')
    setSelectedAreas([])
    setPage(0)
    setTimeout(loadRentals, 0)
  }

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Navigation Bar */}
      <div
        className="header-wrapper"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 30px',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <div className="header-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
              <h1 className="header-title" style={{ margin: 0, fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', cursor: 'pointer' }}>StreetEasyAndMe</h1>
            </Link>
            <nav className="header-nav" style={{ display: 'flex', gap: '30px' }}>
              <Link
                to="/"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  textDecoration: 'none',
                  fontSize: '15px',
                  paddingBottom: '5px',
                  transition: 'all 0.2s',
                }}
              >
                My Listings
              </Link>
              <Link
                to="/rentals"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  borderBottom: '3px solid white',
                  paddingBottom: '5px',
                  transition: 'all 0.2s',
                }}
              >
                Browse Rentals
              </Link>
              <Link
                to="/searches"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  textDecoration: 'none',
                  fontSize: '15px',
                  paddingBottom: '5px',
                  transition: 'all 0.2s',
                }}
              >
                Searches
              </Link>
            </nav>
          </div>
          <button
            className="header-logout"
            onClick={logout}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <SearchContextBar />

      <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>

      {/* MVP Disclaimer */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: '#fef3c7',
        border: '2px solid #fde68a',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>ℹ️</span>
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#92400e'
            }}>
              MVP Notice
            </h3>
            <p style={{
              margin: 0,
              color: '#92400e',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              This is an early version showing rentals in {availableAreas.length > 0 ? (
                <>
                  <strong>
                    {availableAreas.length === 1
                      ? availableAreas[0]
                      : availableAreas.length === 2
                      ? `${availableAreas[0]} and ${availableAreas[1]}`
                      : `${availableAreas.slice(0, -1).join(', ')}, and ${availableAreas[availableAreas.length - 1]}`}
                  </strong>
                </>
              ) : (
                <strong>selected Brooklyn neighborhoods</strong>
              )}.
              The listings are automatically scraped and updated from StreetEasy.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }} style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Filters</h3>

        {/* Neighborhood Selector */}
        {availableAreas.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Neighborhoods
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '10px'
            }}>
              {availableAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: selectedAreas.includes(area)
                      ? '2px solid #667eea'
                      : '2px solid #d1d5db',
                    backgroundColor: selectedAreas.includes(area)
                      ? '#667eea'
                      : 'white',
                    color: selectedAreas.includes(area)
                      ? 'white'
                      : '#4b5563',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedAreas.includes(area)) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                      e.currentTarget.style.borderColor = '#9ca3af'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedAreas.includes(area)) {
                      e.currentTarget.style.backgroundColor = 'white'
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }
                  }}
                >
                  {selectedAreas.includes(area) && '✓ '}
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}

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
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(102, 126, 234, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.35)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.25)'
            }}
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              padding: '10px 24px',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
            }}
          >
            Clear
          </button>
        </div>
      </form>

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
              <div key={rental.id} style={{
                padding: '24px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                  {rental.image_url && (
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={rental.image_url}
                        alt={formatListingTitle(rental.url)}
                        style={{
                          width: '220px',
                          height: '165px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                      {formatListingTitle(rental.url)}
                    </h3>
                    {rental.area_name && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {rental.area_name}
                        </span>
                      </div>
                    )}
                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
                      {rental.bedrooms === 0 ? 'Studio' : `${rental.bedrooms} Bedroom${rental.bedrooms > 1 ? 's' : ''}`}
                      {' • '}
                      {rental.bathrooms} Bath{rental.bathrooms !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '10px' }}>
                      ${rental.price.toLocaleString()}/mo
                    </div>
                    <a href={rental.url} target="_blank" rel="noopener noreferrer" style={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}>
                      View on StreetEasy →
                    </a>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <button
                      onClick={() => handleToggleFavorite(rental)}
                      disabled={favoritingId === rental.id}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: isFavorited(rental.id) ? '#10b981' : '#fbbf24',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: favoritingId === rental.id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        opacity: favoritingId === rental.id ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (favoritingId !== rental.id) {
                          e.currentTarget.style.backgroundColor = isFavorited(rental.id) ? '#059669' : '#f59e0b'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isFavorited(rental.id) ? '#10b981' : '#fbbf24'
                      }}
                    >
                      {favoritingId === rental.id
                        ? '...'
                        : isFavorited(rental.id)
                        ? '✓ In My Listings'
                        : '+ Add to Listings'}
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
              style={{
                padding: '10px 20px',
                background: page === 0 ? '#f3f4f6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: page === 0 ? '#9ca3af' : 'white',
                border: page === 0 ? '1px solid #e5e7eb' : 'none',
                borderRadius: '8px',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: page === 0 ? 'none' : '0 2px 4px rgba(102, 126, 234, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (page !== 0) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.35)'
                }
              }}
              onMouseLeave={(e) => {
                if (page !== 0) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.25)'
                }
              }}
            >
              Previous
            </button>
            <span style={{
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '600',
              color: '#4b5563'
            }}>
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={rentals.length < limit}
              style={{
                padding: '10px 20px',
                background: rentals.length < limit ? '#f3f4f6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: rentals.length < limit ? '#9ca3af' : 'white',
                border: rentals.length < limit ? '1px solid #e5e7eb' : 'none',
                borderRadius: '8px',
                cursor: rentals.length < limit ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: rentals.length < limit ? 'none' : '0 2px 4px rgba(102, 126, 234, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (rentals.length >= limit) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.35)'
                }
              }}
              onMouseLeave={(e) => {
                if (rentals.length >= limit) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.25)'
                }
              }}
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
