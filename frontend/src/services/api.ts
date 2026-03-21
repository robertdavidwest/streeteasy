const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface LoginRequest {
  email: string
  password: string
}

interface SignupRequest {
  email: string
  password: string
}

interface AuthResponse {
  access_token: string
  token_type: string
}

interface UserResponse {
  id: string
  email: string
  created_at: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(
      error.detail || 'An error occurred',
      response.status,
      error
    )
  }
  return response.json()
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<AuthResponse>(response)
  },

  async signup(data: SignupRequest): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<UserResponse>(response)
  },

  async getMe(token: string): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<UserResponse>(response)
  },
}

export { ApiError }
export type { LoginRequest, SignupRequest, AuthResponse, UserResponse }
