import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import Dashboard from '@/components/ui/Dashboard.jsx'
import AuthModal from '@/components/ui/AuthModal.jsx'

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  // This function will be passed to the AuthModal
  const handleAuthSuccess = (authData) => {
    const { token, user } = authData
    localStorage.setItem('authToken', token)
    setToken(token)
    setUser(user)
    setIsAuthModalOpen(false) // Close the modal on success
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  // If we have a token but no user data, we could fetch it here
  // For now, we'll just check for the token's existence
  useEffect(() => {
    if (token && !user) {
      // In a real app, you'd verify the token with the backend and get user data
      // For this version, we'll just set a placeholder user if a token exists
      setUser({ firstName: 'User' }) 
    }
  }, [token, user])

  if (token) {
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
          onAuthSuccess={handleAuthSuccess} // This was the missing piece
        />
      )}
    </div>
  )
}

export default App
