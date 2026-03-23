import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SearchProvider } from './contexts/SearchContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RentalsPage from './pages/RentalsPage'
import FavoritesPage from './pages/FavoritesPage'
import SearchesPage from './pages/SearchesPage'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <FavoritesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/rentals"
              element={
                <PrivateRoute>
                  <RentalsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <FavoritesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/searches"
              element={
                <PrivateRoute>
                  <SearchesPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </SearchProvider>
    </AuthProvider>
  )
}

export default App
