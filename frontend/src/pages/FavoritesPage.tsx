import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { favoritesApi, Favorite, ApiError } from '../services/api'

export default function FavoritesPage() {
  const { token, logout } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)

  const loadFavorites = async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const data = await favoritesApi.list(token)
      setFavorites(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load favorites')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId: number) => {
    if (!token) return

    setRemovingId(favoriteId)

    try {
      await favoritesApi.delete(token, favoriteId)
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to remove favorite')
      }
    } finally {
      setRemovingId(null)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <div>
          <Link
            to="/"
            style={{ color: '#007bff', textDecoration: 'none', marginRight: '20px' }}
          >
            ← Dashboard
          </Link>
          <h1 style={{ display: 'inline' }}>My Favorites</h1>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading favorites...
        </div>
      ) : favorites.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: '#6c757d' }}>No favorites yet</h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            Start favoriting rentals to track them here
          </p>
          <Link
            to="/rentals"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Browse Rentals
          </Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px', color: '#6c757d' }}>
            {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {favorite.rental ? (
                      <>
                        <h3 style={{ margin: '0 0 10px 0' }}>
                          {favorite.rental.bedrooms === 0
                            ? 'Studio'
                            : `${favorite.rental.bedrooms} Bedroom${favorite.rental.bedrooms > 1 ? 's' : ''}`}
                          {' • '}
                          {favorite.rental.bathrooms} Bath
                          {favorite.rental.bathrooms !== 1 ? 's' : ''}
                        </h3>
                        <div
                          style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#28a745',
                            marginBottom: '10px',
                          }}
                        >
                          ${favorite.rental.price.toLocaleString()}/mo
                        </div>
                        <a
                          href={favorite.rental.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#007bff', textDecoration: 'none' }}
                        >
                          View on StreetEasy →
                        </a>
                      </>
                    ) : (
                      <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        Rental not found
                      </div>
                    )}

                    {favorite.events.length > 0 && (
                      <div
                        style={{
                          marginTop: '15px',
                          paddingTop: '15px',
                          borderTop: '1px solid #dee2e6',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '10px',
                          }}
                        >
                          Events ({favorite.events.length})
                        </div>
                        {favorite.events.map((event) => (
                          <div
                            key={event.id}
                            style={{
                              fontSize: '14px',
                              color: '#6c757d',
                              marginBottom: '5px',
                            }}
                          >
                            • {event.event_type.replace('_', ' ')} -{' '}
                            {new Date(event.event_date).toLocaleDateString()}
                            {event.notes && `: ${event.notes}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      disabled={removingId === favorite.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: removingId === favorite.id ? 'not-allowed' : 'pointer',
                        opacity: removingId === favorite.id ? 0.6 : 1,
                      }}
                    >
                      {removingId === favorite.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
