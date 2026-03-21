import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { favoritesApi, eventsApi, Favorite, Event, EventCreate, EventUpdate, ApiError } from '../services/api'
import EventForm from '../components/EventForm'
import { formatListingTitle } from '../utils/formatters'

export default function FavoritesPage() {
  const { token, logout } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [addingEventToId, setAddingEventToId] = useState<number | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null)

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

  const handleAddEvent = async (favoriteId: number, data: EventCreate) => {
    if (!token) return

    const newEvent = await eventsApi.create(token, favoriteId, data)
    setFavorites((prev) =>
      prev.map((fav) =>
        fav.id === favoriteId
          ? { ...fav, events: [...fav.events, newEvent] }
          : fav
      )
    )
    setAddingEventToId(null)
  }

  const handleUpdateEvent = async (eventId: number, data: EventUpdate) => {
    if (!token) return

    const updatedEvent = await eventsApi.update(token, eventId, data as EventCreate)
    setFavorites((prev) =>
      prev.map((fav) => ({
        ...fav,
        events: fav.events.map((evt) =>
          evt.id === eventId ? updatedEvent : evt
        ),
      }))
    )
    setEditingEvent(null)
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!token) return

    setDeletingEventId(eventId)

    try {
      await eventsApi.delete(token, eventId)
      setFavorites((prev) =>
        prev.map((fav) => ({
          ...fav,
          events: fav.events.filter((evt) => evt.id !== eventId),
        }))
      )
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to delete event')
      }
    } finally {
      setDeletingEventId(null)
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

                    <div
                      style={{
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #dee2e6',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          Events ({favorite.events.length})
                        </div>
                        {addingEventToId !== favorite.id && (
                          <button
                            onClick={() => setAddingEventToId(favorite.id)}
                            style={{
                              padding: '4px 12px',
                              fontSize: '12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            + Add Event
                          </button>
                        )}
                      </div>

                      {addingEventToId === favorite.id && (
                        <div style={{ marginBottom: '15px' }}>
                          <EventForm
                            onSubmit={(data) => handleAddEvent(favorite.id, data)}
                            onCancel={() => setAddingEventToId(null)}
                            submitLabel="Add Event"
                          />
                        </div>
                      )}

                      {favorite.events.length > 0 && (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {favorite.events.map((event) => (
                            <div key={event.id}>
                              {editingEvent?.id === event.id ? (
                                <EventForm
                                  onSubmit={(data) => handleUpdateEvent(event.id, data)}
                                  onCancel={() => setEditingEvent(null)}
                                  initialData={event}
                                  submitLabel="Update Event"
                                />
                              ) : (
                                <div
                                  style={{
                                    padding: '10px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                      {event.event_type.replace('_', ' ')}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '2px' }}>
                                      {new Date(event.event_date).toLocaleDateString()}
                                    </div>
                                    {event.notes && (
                                      <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '5px' }}>
                                        {event.notes}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                                    <button
                                      onClick={() => setEditingEvent(event)}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        backgroundColor: '#ffc107',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(event.id)}
                                      disabled={deletingEventId === event.id}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: deletingEventId === event.id ? 'not-allowed' : 'pointer',
                                        opacity: deletingEventId === event.id ? 0.6 : 1,
                                      }}
                                    >
                                      {deletingEventId === event.id ? '...' : 'Delete'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
