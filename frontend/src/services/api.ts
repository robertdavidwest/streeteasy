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
  image_url: string | null
  area_name: string | null
}

interface RentalsParams {
  skip?: number
  limit?: number
  min_price?: number
  max_price?: number
  min_bedrooms?: number
  max_bedrooms?: number
  search?: string
  areas?: string[]
}

type FavoriteState =
  | 'interested'
  | 'reached_out'
  | 'showing_scheduled'
  | 'viewed'
  | 'applied'
  | 'rejected'

interface Favorite {
  id: number
  user_id: string
  rental_id: string
  current_state: FavoriteState
  showing_datetime: string | null
  not_interested_reason: string | null
  interested_reason: string | null
  applied_reason: string | null
  viewed_reason: string | null
  is_deleted: boolean
  state_updated_at: string
  created_at: string
  updated_at: string
  rental: Rental | null
  events: Event[]
}

interface FavoriteUpdate {
  current_state: FavoriteState
  showing_datetime?: string | null
  not_interested_reason?: string | null
  interested_reason?: string | null
  applied_reason?: string | null
  viewed_reason?: string | null
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

interface RegistrationStatus {
  is_open: boolean
  current_users: number
  max_users: number
  slots_available: number
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

  async getRegistrationStatus(): Promise<RegistrationStatus> {
    const response = await fetch(`${API_URL}/api/auth/registration-status`)
    return handleResponse<RegistrationStatus>(response)
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
    if (params?.search !== undefined) queryParams.set('search', params.search)
    if (params?.areas !== undefined && params.areas.length > 0) {
      params.areas.forEach(area => queryParams.append('areas', area))
    }

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

  async getAreas(token: string): Promise<string[]> {
    const response = await fetch(`${API_URL}/api/rentals/areas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<string[]>(response)
  },
}

export const favoritesApi = {
  async list(token: string, searchId?: string): Promise<Favorite[]> {
    const url = searchId
      ? `${API_URL}/api/favorites?search_id=${searchId}`
      : `${API_URL}/api/favorites`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<Favorite[]>(response)
  },

  async create(token: string, rental_id: string, search_id: string): Promise<Favorite> {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rental_id, search_id }),
    })
    return handleResponse<Favorite>(response)
  },

  async update(token: string, favoriteId: number, data: FavoriteUpdate): Promise<Favorite> {
    const response = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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

  async restore(token: string, favoriteId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/favorites/${favoriteId}/restore`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to restore favorite',
        response.status,
        error
      )
    }
  },

  async permanentDelete(token: string, favoriteId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/favorites/${favoriteId}/permanent`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to permanently delete favorite',
        response.status,
        error
      )
    }
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

// Search types
type MemberRole = 'owner' | 'editor' | 'viewer'

interface SearchMember {
  id: string
  user_id: string
  user_email: string
  role: MemberRole
  invited_by?: string
  invited_at?: string
  accepted_at?: string
  created_at: string
}

interface Search {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  updated_at?: string
  members: SearchMember[]
  favorites_count: number
  user_role?: MemberRole
}

interface SearchListItem {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  favorites_count: number
  member_count: number
  user_role: MemberRole
}

interface SearchCreate {
  name: string
  description?: string
}

interface SearchUpdate {
  name?: string
  description?: string
}

interface InviteMemberRequest {
  email: string
  role: MemberRole
}

interface SearchInvitation {
  id: string
  search_id: string
  search_name: string
  email: string
  invited_by: string
  inviter_email: string
  token: string
  expires_at: string
  created_at: string
}

export const searchesApi = {
  async list(token: string): Promise<SearchListItem[]> {
    const response = await fetch(`${API_URL}/api/searches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<SearchListItem[]>(response)
  },

  async getById(token: string, id: string): Promise<Search> {
    const response = await fetch(`${API_URL}/api/searches/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return handleResponse<Search>(response)
  },

  async create(token: string, data: SearchCreate): Promise<Search> {
    const response = await fetch(`${API_URL}/api/searches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<Search>(response)
  },

  async update(token: string, id: string, data: SearchUpdate): Promise<Search> {
    const response = await fetch(`${API_URL}/api/searches/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<Search>(response)
  },

  async delete(token: string, id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/searches/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to delete search',
        response.status,
        error
      )
    }
  },

  async inviteMember(token: string, searchId: string, data: InviteMemberRequest): Promise<SearchInvitation> {
    const response = await fetch(`${API_URL}/api/searches/${searchId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<SearchInvitation>(response)
  },

  async acceptInvitation(token: string, invitationToken: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/searches/invitations/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: invitationToken }),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to accept invitation',
        response.status,
        error
      )
    }
  },

  async removeMember(token: string, searchId: string, memberId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/searches/${searchId}/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to remove member',
        response.status,
        error
      )
    }
  },

  async updateMemberRole(token: string, searchId: string, memberId: string, role: MemberRole): Promise<void> {
    const response = await fetch(`${API_URL}/api/searches/${searchId}/members/${memberId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Failed to update member role',
        response.status,
        error
      )
    }
  },
}

export { ApiError }
export type { LoginRequest, SignupRequest, AuthResponse, UserResponse, Rental, RentalsParams, Favorite, FavoriteState, FavoriteUpdate, Event, EventCreate, EventUpdate, Search, SearchListItem, SearchCreate, SearchUpdate, SearchMember, MemberRole, InviteMemberRequest, SearchInvitation }
