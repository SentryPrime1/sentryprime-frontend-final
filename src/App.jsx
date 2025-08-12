import React, { useState, useEffect } from 'react'
import AuthModal from './components/ui/AuthModal.jsx'
import Dashboard from './components/ui/Dashboard.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [showAuth, setShowAuth] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      // In a real app, you'd verify the token with the backend here
      // For now, we'll just assume the token is valid if it exists
      const storedUser = JSON.parse(localStorage.getItem('user'))
      setUser(storedUser)
      setToken(storedToken)
      setShowAuth(false)
    } else {
      setShowAuth(true)
    }
  }, [])

  const handleAuthSuccess = (authData) => {
    localStorage.setItem('authToken', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))
    setUser(authData.user)
    setToken(authData.token)
    setShowAuth(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    setShowAuth(true)
  }

  if (showAuth) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
