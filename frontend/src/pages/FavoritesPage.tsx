import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { favoritesApi, Favorite, FavoriteState, FavoriteUpdate, ApiError } from '../services/api'
import { formatListingTitle } from '../utils/formatters'

export default function FavoritesPage() {
  const { token, logout } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

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

  const handleUpdateState = async (favoriteId: number, data: FavoriteUpdate) => {
    if (!token) return

    setUpdatingId(favoriteId)

    try {
      const updated = await favoritesApi.update(token, favoriteId, data)
      setFavorites((prev) =>
        prev.map((fav) => (fav.id === favoriteId ? updated : fav))
      )
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to update state')
      }
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  // Group favorites by state
  const groupedFavorites: Record<FavoriteState, Favorite[]> = {
    showing_scheduled: [],
    reached_out: [],
    interested: [],
    viewed: [],
    applied: [],
    rejected: [],
  }

  favorites.forEach((fav) => {
    groupedFavorites[fav.current_state].push(fav)
  })

  // Sort showing_scheduled by datetime
  groupedFavorites.showing_scheduled.sort((a, b) => {
    if (!a.showing_datetime) return 1
    if (!b.showing_datetime) return -1
    return new Date(a.showing_datetime).getTime() - new Date(b.showing_datetime).getTime()
  })

  const stateLabels: Record<FavoriteState, string> = {
    showing_scheduled: 'Upcoming Showings',
    reached_out: 'Reached Out',
    interested: 'Interested',
    viewed: 'Past Showings',
    applied: 'Applied',
    rejected: 'Not Interested',
  }

  const stateSections: FavoriteState[] = [
    'showing_scheduled',
    'reached_out',
    'interested',
    'viewed',
    'applied',
    'rejected',
  ]

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
          {stateSections.map((state) => {
            const items = groupedFavorites[state]
            if (items.length === 0) return null

            return (
              <div key={state} style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#495057' }}>
                  {stateLabels[state]} ({items.length})
                </h2>

                <div style={{ display: 'grid', gap: '15px' }}>
                  {items.map((favorite) => (
                    <FavoriteCard
                      key={favorite.id}
                      favorite={favorite}
                      onUpdateState={handleUpdateState}
                      onRemove={handleRemoveFavorite}
                      isRemoving={removingId === favorite.id}
                      isUpdating={updatingId === favorite.id}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

interface FavoriteCardProps {
  favorite: Favorite
  onUpdateState: (id: number, data: FavoriteUpdate) => void
  onRemove: (id: number) => void
  isRemoving: boolean
  isUpdating: boolean
}

function FavoriteCard({ favorite, onUpdateState, onRemove, isRemoving, isUpdating }: FavoriteCardProps) {
  const [state, setState] = useState<FavoriteState>(favorite.current_state)
  const [showingDatetime, setShowingDatetime] = useState(
    favorite.showing_datetime ? new Date(favorite.showing_datetime).toISOString().slice(0, 16) : ''
  )
  const [showHistory, setShowHistory] = useState(false)

  const handleStateChange = (newState: FavoriteState) => {
    setState(newState)
    if (newState !== 'showing_scheduled') {
      onUpdateState(favorite.id, { current_state: newState })
    }
  }

  const handleDatetimeChange = (datetime: string) => {
    setShowingDatetime(datetime)
    if (datetime) {
      onUpdateState(favorite.id, {
        current_state: 'showing_scheduled',
        showing_datetime: new Date(datetime).toISOString(),
      })
    }
  }

  return (
    <div
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
          gap: '20px',
        }}
      >
        {favorite.rental?.image_url && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={favorite.rental.image_url}
              alt={formatListingTitle(favorite.rental.url)}
              style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          {favorite.rental ? (
            <>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                {formatListingTitle(favorite.rental.url)}
              </h3>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
                {favorite.rental.bedrooms === 0
                  ? 'Studio'
                  : `${favorite.rental.bedrooms} Bedroom${favorite.rental.bedrooms > 1 ? 's' : ''}`}
                {' • '}
                {favorite.rental.bathrooms} Bath
                {favorite.rental.bathrooms !== 1 ? 's' : ''}
              </div>
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
                style={{ color: '#007bff', textDecoration: 'none', marginBottom: '15px', display: 'inline-block' }}
              >
                View on StreetEasy →
              </a>
            </>
          ) : (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
              Rental not found
            </div>
          )}

          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  Status
                </label>
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value as FavoriteState)}
                  disabled={isUpdating}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  <option value="interested">Interested</option>
                  <option value="reached_out">Reached Out</option>
                  <option value="showing_scheduled">Showing Scheduled</option>
                  <option value="viewed">Viewed</option>
                  <option value="applied">Applied</option>
                  <option value="rejected">Not Interested</option>
                </select>
              </div>

              {state === 'showing_scheduled' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                    Showing Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={showingDatetime}
                    onChange={(e) => handleDatetimeChange(e.target.value)}
                    disabled={isUpdating}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      opacity: isUpdating ? 0.6 : 1,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Always show showing datetime if it exists */}
            {favorite.showing_datetime && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#6c757d' }}>
                {state === 'showing_scheduled' && 'Showing scheduled for: '}
                {state === 'viewed' && 'Showing was on: '}
                {state !== 'showing_scheduled' && state !== 'viewed' && 'Showing date: '}
                {new Date(favorite.showing_datetime).toLocaleString()}
              </div>
            )}

            {/* History section */}
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#007bff',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {showHistory ? '▼' : '▶'} View History
              </button>

              {showHistory && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '14px' }}>
                    {/* Favorited date */}
                    <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #dee2e6' }}>
                      <strong>Favorited:</strong> {new Date(favorite.created_at).toLocaleString()}
                    </div>

                    {/* State change history */}
                    {favorite.events && favorite.events.length > 0 ? (
                      <>
                        <strong>State Changes:</strong>
                        {favorite.events
                          .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                          .map((event, idx) => (
                            <div key={idx} style={{ marginTop: '5px', paddingLeft: '10px' }}>
                              • {new Date(event.event_date).toLocaleString()} - Changed to{' '}
                              <strong>{event.event_type.replace('_', ' ')}</strong>
                              {event.notes && ` (${event.notes})`}
                            </div>
                          ))}
                      </>
                    ) : (
                      <div style={{ color: '#6c757d', fontStyle: 'italic' }}>No state changes yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={() => onRemove(favorite.id)}
            disabled={isRemoving}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRemoving ? 'not-allowed' : 'pointer',
              opacity: isRemoving ? 0.6 : 1,
            }}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}
