import { useState, FormEvent } from 'react'
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
  const navigate = useNavigate()

  const getPasswordStrength = () => {
    return passwordRequirements.filter((req) => req.test(password)).length
  }

  const isPasswordValid = () => {
    return passwordRequirements.every((req) => req.test(password))
  }

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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Sign Up for StreetEasyAndMe</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '5px' }}
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
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: '5px' }}
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
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />

          {password && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  fontSize: '12px',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                }}
              >
                Password strength: {getPasswordStrength()}/
                {passwordRequirements.length}
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                {passwordRequirements.map((req, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: req.test(password) ? '#28a745' : '#dc3545',
                    }}
                  >
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="confirmPassword"
            style={{ display: 'block', marginBottom: '5px' }}
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
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '4px',
            }}
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#007bff' }}>
          Login
        </Link>
      </p>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <strong>Note:</strong> Only the first person to sign up can create an
        account. Registration will be closed after that.
      </div>
    </div>
  )
}
