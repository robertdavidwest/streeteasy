import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { logout } = useAuth()

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <h1>StreetEasyAndMe</h1>
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

      <div
        style={{
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          marginBottom: '30px',
        }}
      >
        <h2>Welcome!</h2>
        <p>Your account is set up and ready to go.</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <Link
          to="/rentals"
          style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>Browse Rentals</h3>
          <p style={{ margin: 0, color: '#6c757d' }}>
            View all available apartment listings in Greenpoint, Brooklyn
          </p>
        </Link>

        <Link
          to="/favorites"
          style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            border: '1px solid #dee2e6',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>My Favorites</h3>
          <p style={{ margin: 0, color: '#6c757d' }}>
            Track your favorited listings and manage events
          </p>
        </Link>
      </div>
    </div>
  )
}
