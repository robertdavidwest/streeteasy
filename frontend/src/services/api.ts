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

interface Rental {
  id: string
  url: string
  bedrooms: number
  bathrooms: number
  price: number
}

interface RentalsParams {
  skip?: number
  limit?: number
  min_price?: number
  max_price?: number
  min_bedrooms?: number
  max_bedrooms?: number
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

export const rentalsApi = {
  async list(token: string, params?: RentalsParams): Promise<Rental[]> {
    const queryParams = new URLSearchParams()
    if (params?.skip !== undefined) queryParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString())
    if (params?.min_price !== undefined) queryParams.set('min_price', params.min_price.toString())
    if (params?.max_price !== undefined) queryParams.set('max_price', params.max_price.toString())
    if (params?.min_bedrooms !== undefined) queryParams.set('min_bedrooms', params.min_bedrooms.toString())
    if (params?.max_bedrooms !== undefined) queryParams.set('max_bedrooms', params.max_bedrooms.toString())

    const url = `${API_URL}/api/rentals?${queryParams.toString()}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<Rental[]>(response)
  },

  async getById(token: string, id: string): Promise<Rental> {
    const response = await fetch(`${API_URL}/api/rentals/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<Rental>(response)
  },
}

export { ApiError }
export type { LoginRequest, SignupRequest, AuthResponse, UserResponse, Rental, RentalsParams }
