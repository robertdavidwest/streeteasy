import { useState } from 'react'
import { useSearch } from '../contexts/SearchContext'
import { Link, useNavigate } from 'react-router-dom'

export default function SearchSelector() {
  const { searches, currentSearch, selectSearch, isLoading } = useSearch()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  if (isLoading) {
    return <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading searches...</div>
  }

  if (searches.length === 0) {
    return null
  }

  const handleSearchClick = (searchId: string) => {
    selectSearch(searchId)
    setShowDropdown(false)
  }

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <Link
        to="/searches"
        style={{
          color: 'rgba(255, 255, 255, 0.85)',
          textDecoration: 'none',
          fontSize: '15px',
          paddingBottom: '5px',
          transition: 'all 0.2s',
          display: 'inline-block',
        }}
      >
        Searches {currentSearch && `(${currentSearch.name})`}
      </Link>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            paddingTop: '10px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '250px',
              overflow: 'hidden',
            }}
          >
          <div style={{ padding: '8px 0' }}>
            {searches.map((search) => (
              <div
                key={search.id}
                onClick={() => handleSearchClick(search.id)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: search.id === currentSearch?.id ? '#f0f0f0' : 'white',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (search.id !== currentSearch?.id) {
                    e.currentTarget.style.backgroundColor = '#f8f8f8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (search.id !== currentSearch?.id) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <div>
                  <div style={{
                    fontWeight: search.id === currentSearch?.id ? '600' : '400',
                    color: '#333',
                    fontSize: '14px',
                  }}>
                    {search.name}
                    {search.user_role === 'owner' && ' 👑'}
                    {search.user_role === 'editor' && ' ✏️'}
                    {search.user_role === 'viewer' && ' 👁️'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {search.favorites_count} favorite{search.favorites_count !== 1 ? 's' : ''}
                  </div>
                </div>
                {search.id === currentSearch?.id && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#667eea'
                  }} />
                )}
              </div>
            ))}

            <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
              <div
                onClick={() => {
                  setShowDropdown(false)
                  navigate('/searches')
                }}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#667eea',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f8f8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span style={{ fontSize: '16px' }}>+</span>
                Create New Search
              </div>
              <div
                onClick={() => {
                  setShowDropdown(false)
                  navigate('/searches')
                }}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#666',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f8f8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span style={{ fontSize: '16px' }}>⚙️</span>
                Manage All Searches
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}