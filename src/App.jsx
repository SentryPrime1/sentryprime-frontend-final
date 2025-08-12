import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import Dashboard from '@/components/Dashboard.jsx' // Corrected path
import AuthModal from '@/components/ui/AuthModal.jsx'

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  const handleAuthSuccess = (authData) => {
    const { token, user } = authData
    localStorage.setItem('authToken', token)
    setToken(token)
    setUser(user)
    setIsAuthModalOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      // In a real app, you would verify the token with the backend here
      // For now, we'll just assume the token is valid and set a placeholder user
      // This ensures the dashboard loads on refresh if a token exists.
      setToken(storedToken)
      // You might want to decode the token to get user info if it's stored there
      // For now, a simple placeholder will do.
      setUser({ firstName: 'User' }) 
    }
  }, [])

  if (token) {
    // Pass the actual user object and the logout handler to the Dashboard
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to SentryPrime</h1>
        <p className="text-xl text-gray-400 mb-8">
          Your AI-powered solution for web accessibility and compliance.
        </p>
        <Button onClick={() => setIsAuthModalOpen(true)} size="lg">
          Get Started
        </Button>
      </div>

      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}

export default App
