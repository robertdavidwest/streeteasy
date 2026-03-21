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

interface Favorite {
  id: number
  user_id: string
  rental_id: string
  created_at: string
  updated_at: string
  rental: Rental | null
  events: Event[]
}

interface Event {
  id: number
  favorite_id: number
  event_type: 'reached_out' | 'viewed' | 'applied' | 'custom'
  event_date: string
  notes: string | null
  created_at: string
  updated_at: string
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

export const favoritesApi = {
  async list(token: string): Promise<Favorite[]> {
    const response = await fetch(`${API_URL}/api/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<Favorite[]>(response)
  },

  async create(token: string, rental_id: string): Promise<Favorite> {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rental_id }),
    })
    return handleResponse<Favorite>(response)
  },

  async delete(token: string, favoriteId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to delete favorite',
        response.status,
        error
      )
    }
  },

  async getById(token: string, favoriteId: number): Promise<Favorite> {
    const response = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<Favorite>(response)
  },
}

interface EventCreate {
  event_type: 'reached_out' | 'viewed' | 'applied' | 'custom'
  event_date: string
  notes?: string
}

interface EventUpdate {
  event_type?: 'reached_out' | 'viewed' | 'applied' | 'custom'
  event_date?: string
  notes?: string
}

export const eventsApi = {
  async create(token: string, favoriteId: number, data: EventCreate): Promise<Event> {
    const response = await fetch(`${API_URL}/api/favorites/${favoriteId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<Event>(response)
  },

  async update(token: string, eventId: number, data: EventUpdate): Promise<Event> {
    const response = await fetch(`${API_URL}/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<Event>(response)
  },

  async delete(token: string, eventId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to delete event',
        response.status,
        error
      )
    }
  },
}

export { ApiError }
export type { LoginRequest, SignupRequest, AuthResponse, UserResponse, Rental, RentalsParams, Favorite, Event, EventCreate, EventUpdate }
