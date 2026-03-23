import { useState } from 'react'
import { useSearch } from '../contexts/SearchContext'
import { useNavigate } from 'react-router-dom'

export default function SearchContextBar() {
  const { searches, currentSearch, selectSearch, isLoading } = useSearch()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  if (isLoading || !currentSearch) {
    return null
  }

  const handleSearchClick = (searchId: string) => {
    selectSearch(searchId)
    setShowDropdown(false)
  }

  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        padding: '12px 30px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>Current Search:</span>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                minWidth: '200px',
                textAlign: 'left',
              }}
            >
              <span style={{ flex: 1 }}>
                {currentSearch.name}
                {currentSearch.user_role === 'owner' && ' 👑'}
                {currentSearch.user_role === 'editor' && ' ✏️'}
                {currentSearch.user_role === 'viewer' && ' 👁️'}
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                ({currentSearch.favorites_count})
              </span>
              <span style={{ marginLeft: '8px', fontSize: '10px' }}>▼</span>
            </button>

            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: '0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: '250px',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
              >
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                        borderBottom: '1px solid #f0f0f0',
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
                          {search.favorites_count} listings · {search.member_count} member{search.member_count !== 1 ? 's' : ''}
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
                </div>

                <div style={{ borderTop: '1px solid #eee', padding: '8px' }}>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      navigate('/searches')
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>+</span>
                    Create New Search
                  </button>
                </div>
              </div>
            )}
          </div>

          {currentSearch.member_count > 1 && (
            <span style={{
              fontSize: '12px',
              color: '#666',
              backgroundColor: '#e8f4f8',
              padding: '3px 8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>👥</span>
              {currentSearch.member_count} members
            </span>
          )}
        </div>

        <button
          onClick={() => navigate('/searches')}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '1px solid #667eea',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
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
          Manage Searches
        </button>
      </div>
    </div>
  )
}