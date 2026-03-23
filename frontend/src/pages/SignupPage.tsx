import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi, ApiError } from '../services/api'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 12 characters', test: (p) => p.length >= 12 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /\d/.test(p) },
  {
    label: 'Contains special character',
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<{
    is_open: boolean
    current_users: number
    max_users: number
    slots_available: number
  } | null>(null)
  const navigate = useNavigate()

  const getPasswordStrength = () => {
    return passwordRequirements.filter((req) => req.test(password)).length
  }

  const isPasswordValid = () => {
    return passwordRequirements.every((req) => req.test(password))
  }

  useEffect(() => {
    // Fetch registration status on component mount
    const fetchStatus = async () => {
      try {
        const status = await authApi.getRegistrationStatus()
        setRegistrationStatus(status)
      } catch (err) {
        console.error('Failed to fetch registration status:', err)
      }
    }
    fetchStatus()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isPasswordValid()) {
      setError('Password does not meet all requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await authApi.signup({ email, password })
      setSuccess(
        'Account created successfully! Redirecting to login...'
      )
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.04)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#2d3748',
          letterSpacing: '-0.5px'
        }}>Create Account</h1>
        <p style={{
          color: '#718096',
          marginBottom: '32px',
          fontSize: '15px'
        }}>Join StreetEasyAndMe</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568'
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568'
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

          {password && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
              <div
                style={{
                  fontSize: '13px',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#4a5568'
                }}
              >
                Password strength: {getPasswordStrength()}/{passwordRequirements.length}
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                {passwordRequirements.map((req, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: req.test(password) ? '#10b981' : '#ef4444',
                      marginBottom: '4px'
                    }}
                  >
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4a5568'
            }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              borderRadius: '8px',
              border: '1.5px solid #e2e8f0',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '20px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '20px',
              backgroundColor: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid #a7f3d0'
            }}
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (registrationStatus ? !registrationStatus.is_open : false)}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: '600',
            background: (loading || (registrationStatus ? !registrationStatus.is_open : false))
              ? '#9ca3af'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (loading || (registrationStatus ? !registrationStatus.is_open : false)) ? 'not-allowed' : 'pointer',
            opacity: (loading || (registrationStatus ? !registrationStatus.is_open : false)) ? 0.7 : 1,
            transition: 'all 0.2s',
            boxShadow: (loading || (registrationStatus ? !registrationStatus.is_open : false)) ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.25)'
          }}
          onMouseEnter={(e) => {
            if (!loading && registrationStatus?.is_open) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.35)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.25)'
          }}
        >
          {loading ? 'Creating account...' : (registrationStatus ? (!registrationStatus.is_open ? 'Registration Closed' : 'Sign Up') : 'Sign Up')}
        </button>
      </form>

      <p style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#718096'
      }}>
        Already have an account?{' '}
        <Link to="/login" style={{
          color: '#667eea',
          textDecoration: 'none',
          fontWeight: '600'
        }}>
          Login
        </Link>
      </p>

      {registrationStatus && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: registrationStatus.is_open ? '#fef3c7' : '#fee2e2',
            borderRadius: '8px',
            fontSize: '14px',
            border: registrationStatus.is_open ? '1px solid #fde68a' : '1px solid #fecaca',
            color: registrationStatus.is_open ? '#92400e' : '#991b1b'
          }}
        >
          {registrationStatus.is_open ? (
            <>
              <strong>Note:</strong> Only the first {registrationStatus.max_users} {registrationStatus.max_users === 1 ? 'person' : 'people'} can sign up.
              {' '}{registrationStatus.slots_available === 1
                ? 'There is 1 slot remaining.'
                : `There are ${registrationStatus.slots_available} slots remaining.`}
            </>
          ) : (
            <>
              <strong>Registration Closed:</strong> Maximum of {registrationStatus.max_users} {registrationStatus.max_users === 1 ? 'user has' : 'users have'} already registered.
            </>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
