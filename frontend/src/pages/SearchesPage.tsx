import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import SearchContextBar from '../components/SearchContextBar'
import { searchesApi, SearchListItem, SearchCreate, Search, SearchMember, MemberRole, ApiError } from '../services/api'

export default function SearchesPage() {
  const { token, logout } = useAuth()
  const { searches, refreshSearches, selectSearch, currentSearchId } = useSearch()
  const [selectedSearch, setSelectedSearch] = useState<Search | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newSearchName, setNewSearchName] = useState('')
  const [newSearchDescription, setNewSearchDescription] = useState('')

  // Invitation states
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('viewer')
  const [inviteSuccess, setInviteSuccess] = useState('')

  const loadSearchDetails = async (searchId: string) => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const data = await searchesApi.getById(token, searchId)
      setSelectedSearch(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load search details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSearch = async () => {
    if (!token || !newSearchName.trim()) return

    setLoading(true)
    setError('')

    try {
      const newSearch = await searchesApi.create(token, {
        name: newSearchName,
        description: newSearchDescription || undefined,
      })
      await refreshSearches()
      selectSearch(newSearch.id)
      setSelectedSearch(newSearch)
      setNewSearchName('')
      setNewSearchDescription('')
      setIsCreating(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to create search')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSearch = async (searchId: string) => {
    if (!token) return

    if (!confirm('Are you sure you want to delete this search? All favorites in this search will be deleted.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await searchesApi.delete(token, searchId)
      await refreshSearches()
      setSelectedSearch(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to delete search')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!token || !selectedSearch || !inviteEmail.trim()) return

    setLoading(true)
    setError('')
    setInviteSuccess('')

    try {
      await searchesApi.inviteMember(token, selectedSearch.id, {
        email: inviteEmail,
        role: inviteRole,
      })
      setInviteEmail('')
      setInviteRole('viewer')
      setInviteSuccess(`Invitation sent to ${inviteEmail}`)
      setIsInviting(false)
      // Reload search details to show updated members
      await loadSearchDetails(selectedSearch.id)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to send invitation')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!token || !selectedSearch) return

    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await searchesApi.removeMember(token, selectedSearch.id, memberId)
      await loadSearchDetails(selectedSearch.id)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to remove member')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
    if (!token || !selectedSearch) return

    setLoading(true)
    setError('')

    try {
      await searchesApi.updateMemberRole(token, selectedSearch.id, memberId, newRole)
      await loadSearchDetails(selectedSearch.id)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to update member role')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentSearchId) {
      loadSearchDetails(currentSearchId)
    }
  }, [currentSearchId])

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
                  color: 'rgba(255, 255, 255, 0.85)',
                  textDecoration: 'none',
                  fontSize: '15px',
                  paddingBottom: '5px',
                  transition: 'all 0.2s',
                }}
              >
                Browse Rentals
              </Link>
              <Link
                to="/searches"
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
          >
            Logout
          </button>
        </div>
      </div>

      <SearchContextBar />

      <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Manage Searches</h2>

        {error && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#c00',
          }}>
            {error}
          </div>
        )}

        {inviteSuccess && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#e6ffed',
            border: '1px solid #34d058',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#22863a',
          }}>
            {inviteSuccess}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
          {/* Searches List */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => setIsCreating(!isCreating)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                + New Search
              </button>
            </div>

            {isCreating && (
              <div style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '8px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <input
                  type="text"
                  placeholder="Search name"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newSearchDescription}
                  onChange={(e) => setNewSearchDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minHeight: '60px',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCreateSearch}
                    disabled={loading || !newSearchName.trim()}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#34d058',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading || !newSearchName.trim() ? 'not-allowed' : 'pointer',
                      opacity: loading || !newSearchName.trim() ? 0.5 : 1,
                    }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewSearchName('')
                      setNewSearchDescription('')
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {searches.map((search) => (
                <div
                  key={search.id}
                  onClick={() => selectSearch(search.id)}
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: search.id === currentSearchId ? '#f8f9fa' : 'white',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                    {search.name}
                    {search.user_role === 'owner' && ' 👑'}
                    {search.user_role === 'editor' && ' ✏️'}
                    {search.user_role === 'viewer' && ' 👁️'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {search.favorites_count} favorites · {search.member_count} member{search.member_count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Details */}
          {selectedSearch && (
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>{selectedSearch.name}</h3>
                {selectedSearch.description && (
                  <p style={{ color: '#666', marginBottom: '15px' }}>{selectedSearch.description}</p>
                )}
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <div>Created: {new Date(selectedSearch.created_at).toLocaleDateString()}</div>
                  <div>{selectedSearch.favorites_count} favorites</div>
                </div>
              </div>

              {/* Members Section */}
              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600' }}>Members</h4>
                  {selectedSearch.user_role !== 'viewer' && (
                    <button
                      onClick={() => setIsInviting(!isInviting)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      + Invite
                    </button>
                  )}
                </div>

                {isInviting && (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '15px',
                  }}>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="viewer">Viewer (can view only)</option>
                      <option value="editor">Editor (can add/edit favorites)</option>
                      <option value="owner">Owner (full access)</option>
                    </select>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleInviteMember}
                        disabled={loading || !inviteEmail.trim()}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#34d058',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: loading || !inviteEmail.trim() ? 'not-allowed' : 'pointer',
                          opacity: loading || !inviteEmail.trim() ? 0.5 : 1,
                        }}
                      >
                        Send Invitation
                      </button>
                      <button
                        onClick={() => {
                          setIsInviting(false)
                          setInviteEmail('')
                          setInviteRole('viewer')
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#f0f0f0',
                          color: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  {selectedSearch.members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '500' }}>{member.user_email}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {member.role === 'owner' && '👑 Owner'}
                          {member.role === 'editor' && '✏️ Editor'}
                          {member.role === 'viewer' && '👁️ Viewer'}
                        </div>
                      </div>
                      {selectedSearch.user_role === 'owner' && member.role !== 'owner' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value as MemberRole)}
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '12px',
                            }}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="owner">Owner</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Search */}
              {selectedSearch.user_role === 'owner' && (
                <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
                  <button
                    onClick={() => handleDeleteSearch(selectedSearch.id)}
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    Delete Search
                  </button>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    This will permanently delete this search and all its favorites.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}