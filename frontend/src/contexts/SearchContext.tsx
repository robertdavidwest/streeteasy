import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { searchesApi, SearchListItem } from '../services/api'

interface SearchContextType {
  searches: SearchListItem[]
  currentSearchId: string | null
  currentSearch: SearchListItem | null
  isLoading: boolean
  error: string | null
  selectSearch: (searchId: string) => void
  refreshSearches: () => Promise<void>
}

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searches, setSearches] = useState<SearchListItem[]>([])
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshSearches = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const searchList = await searchesApi.list(token)
      setSearches(searchList)

      // If no current search selected, select the first one (likely "My Listings")
      if (!currentSearchId && searchList.length > 0) {
        setCurrentSearchId(searchList[0].id)
      }

      setError(null)
    } catch (err) {
      console.error('Failed to load searches:', err)
      setError('Failed to load searches')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshSearches()
  }, [])

  const selectSearch = (searchId: string) => {
    setCurrentSearchId(searchId)
    localStorage.setItem('currentSearchId', searchId)
  }

  // Load saved search from localStorage
  useEffect(() => {
    const savedSearchId = localStorage.getItem('currentSearchId')
    if (savedSearchId && searches.some(s => s.id === savedSearchId)) {
      setCurrentSearchId(savedSearchId)
    }
  }, [searches])

  const currentSearch = searches.find(s => s.id === currentSearchId) || null

  return (
    <SearchContext.Provider
      value={{
        searches,
        currentSearchId,
        currentSearch,
        isLoading,
        error,
        selectSearch,
        refreshSearches,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}