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
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [permanentDeletingId, setPermanentDeletingId] = useState<number | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)

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
      // Reload favorites to get updated is_deleted status
      await loadFavorites()
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

  const handleRestoreFavorite = async (favoriteId: number) => {
    if (!token) return

    setRestoringId(favoriteId)

    try {
      await favoritesApi.restore(token, favoriteId)
      // Reload favorites to get updated is_deleted status
      await loadFavorites()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to restore favorite')
      }
    } finally {
      setRestoringId(null)
    }
  }

  const handlePermanentDelete = async (favoriteId: number) => {
    if (!token) return

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this favorite? This action cannot be undone.'
    )
    if (!confirmed) return

    setPermanentDeletingId(favoriteId)

    try {
      await favoritesApi.permanentDelete(token, favoriteId)
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to permanently delete favorite')
      }
    } finally {
      setPermanentDeletingId(null)
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

  // Separate active and deleted favorites
  const activeFavorites = favorites.filter((f) => !f.is_deleted)
  const deletedFavorites = favorites.filter((f) => f.is_deleted)

  // Group active favorites by state
  const groupedFavorites: Record<FavoriteState, Favorite[]> = {
    showing_scheduled: [],
    reached_out: [],
    interested: [],
    viewed: [],
    applied: [],
    rejected: [],
  }

  activeFavorites.forEach((fav) => {
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
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  borderBottom: '3px solid white',
                  paddingBottom: '5px',
                  transition: 'all 0.2s',
                }}
              >
                My Listings
              </Link>
              <Link
                to="/rentals"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  textDecoration: 'none',
                  fontSize: '15px',
                  paddingBottom: '5px',
                  transition: 'all 0.2s',
                }}
              >
                Browse Rentals
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

      <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>

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
      ) : activeFavorites.length === 0 && deletedFavorites.length === 0 ? (
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
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)',
              transition: 'all 0.2s',
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
              <div key={state} style={{ marginBottom: '50px' }}>
                <h2 style={{
                  fontSize: '22px',
                  marginBottom: '20px',
                  color: '#2d3748',
                  fontWeight: '700',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {stateLabels[state]}
                  <span style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {items.length}
                  </span>
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

          {/* Deleted Listings Section */}
          {deletedFavorites.length > 0 && (
            <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '2px solid #e5e7eb' }}>
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  letterSpacing: '-0.5px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  marginBottom: showDeleted ? '20px' : '0',
                }}
              >
                {showDeleted ? '▼' : '▶'} Deleted Listings
                <span style={{
                  backgroundColor: '#9ca3af',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {deletedFavorites.length}
                </span>
              </button>

              {showDeleted && (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {deletedFavorites.map((favorite) => (
                    <DeletedFavoriteCard
                      key={favorite.id}
                      favorite={favorite}
                      onRestore={handleRestoreFavorite}
                      onPermanentDelete={handlePermanentDelete}
                      isRestoring={restoringId === favorite.id}
                      isPermanentDeleting={permanentDeletingId === favorite.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>
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
  // Helper to convert UTC datetime to local datetime string for datetime-local input
  const toLocalDatetimeString = (isoString: string | null) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    // Get local time components
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [state, setState] = useState<FavoriteState>(favorite.current_state)
  const [showingDatetime, setShowingDatetime] = useState(
    toLocalDatetimeString(favorite.showing_datetime)
  )
  const [showHistory, setShowHistory] = useState(false)

  // Sync local state when favorite prop changes (after successful update)
  useEffect(() => {
    setState(favorite.current_state)
    setShowingDatetime(toLocalDatetimeString(favorite.showing_datetime))
  }, [favorite.current_state, favorite.showing_datetime])

  // Track if there are unsaved changes
  const hasChanges =
    state !== favorite.current_state ||
    (state === 'showing_scheduled' &&
      showingDatetime !== toLocalDatetimeString(favorite.showing_datetime))

  const handleSave = () => {
    const updateData: { current_state: FavoriteState; showing_datetime?: string } = {
      current_state: state,
    }

    if (state === 'showing_scheduled' && showingDatetime) {
      // datetime-local gives us local time, convert to ISO (UTC) for backend
      updateData.showing_datetime = new Date(showingDatetime).toISOString()
    }

    onUpdateState(favorite.id, updateData)
  }

  const handleCancel = () => {
    setState(favorite.current_state)
    setShowingDatetime(toLocalDatetimeString(favorite.showing_datetime))
  }

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'all 0.2s',
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
                  color: '#10b981',
                  marginBottom: '10px',
                }}
              >
                ${favorite.rental.price.toLocaleString()}/mo
              </div>
              <a
                href={favorite.rental.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#667eea', textDecoration: 'none', marginBottom: '15px', display: 'inline-block' }}
              >
                View on StreetEasy →
              </a>
            </>
          ) : (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
              Rental not found
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); if (hasChanges && !(state === 'showing_scheduled' && !showingDatetime)) handleSave(); }} style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  Status
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as FavoriteState)}
                  disabled={isUpdating}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: hasChanges ? '2px solid #ffc107' : '1px solid #ccc',
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
                    onChange={(e) => setShowingDatetime(e.target.value)}
                    disabled={isUpdating}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: hasChanges ? '2px solid #ffc107' : '1px solid #ccc',
                      opacity: isUpdating ? 0.6 : 1,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Save/Cancel buttons */}
            {hasChanges && (
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isUpdating || (state === 'showing_scheduled' && !showingDatetime)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isUpdating || (state === 'showing_scheduled' && !showingDatetime) ? 'not-allowed' : 'pointer',
                    opacity: isUpdating || (state === 'showing_scheduled' && !showingDatetime) ? 0.6 : 1,
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating && (state !== 'showing_scheduled' || showingDatetime)) {
                      e.currentTarget.style.backgroundColor = '#059669'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981'
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.6 : 1,
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdating) {
                      e.currentTarget.style.backgroundColor = '#e5e7eb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

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
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '1.5px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#667eea'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#667eea'
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
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={() => onRemove(favorite.id)}
            disabled={isRemoving}
            style={{
              padding: '10px 18px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isRemoving ? 'not-allowed' : 'pointer',
              opacity: isRemoving ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isRemoving) {
                e.currentTarget.style.backgroundColor = '#4b5563'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280'
            }}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DeletedFavoriteCardProps {
  favorite: Favorite
  onRestore: (id: number) => void
  onPermanentDelete: (id: number) => void
  isRestoring: boolean
  isPermanentDeleting: boolean
}

function DeletedFavoriteCard({
  favorite,
  onRestore,
  onPermanentDelete,
  isRestoring,
  isPermanentDeleting,
}: DeletedFavoriteCardProps) {
  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        opacity: 0.7,
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
              style={{
                width: '220px',
                height: '165px',
                objectFit: 'cover',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                filter: 'grayscale(50%)',
              }}
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
                  color: '#10b981',
                  marginBottom: '10px',
                }}
              >
                ${favorite.rental.price.toLocaleString()}/mo
              </div>
              <a
                href={favorite.rental.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#667eea', textDecoration: 'none', marginBottom: '15px', display: 'inline-block' }}
              >
                View on StreetEasy →
              </a>
            </>
          ) : (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
              Rental not found
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={() => onRestore(favorite.id)}
            disabled={isRestoring || isPermanentDeleting}
            style={{
              padding: '10px 18px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isRestoring || isPermanentDeleting ? 'not-allowed' : 'pointer',
              opacity: isRestoring || isPermanentDeleting ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isRestoring && !isPermanentDeleting) {
                e.currentTarget.style.backgroundColor = '#059669'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981'
            }}
          >
            {isRestoring ? 'Restoring...' : 'Restore'}
          </button>
          <button
            onClick={() => onPermanentDelete(favorite.id)}
            disabled={isRestoring || isPermanentDeleting}
            style={{
              padding: '10px 18px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isRestoring || isPermanentDeleting ? 'not-allowed' : 'pointer',
              opacity: isRestoring || isPermanentDeleting ? 0.6 : 1,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isRestoring && !isPermanentDeleting) {
                e.currentTarget.style.backgroundColor = '#dc2626'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444'
            }}
          >
            {isPermanentDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  )
}
