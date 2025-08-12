import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import AuthModal from './components/ui/AuthModal.jsx'
import UserMenu from './components/ui/UserMenu.jsx'
import Dashboard from './components/ui/Dashboard.jsx'
import { 
  Shield, 
  Search, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Star,
  Loader2,
  Globe,
  Users,
  Award
} from 'lucide-react'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [scanUrl, setScanUrl] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      // TODO: Validate token with backend and get user data
      // For now, we'll just check if token exists
      try {
        // You could decode JWT here to get user info
        // For simplicity, we'll make an API call to get user data
        fetchUserData(token)
      } catch (err) {
        localStorage.removeItem('authToken')
      }
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://web-production-51f3.up.railway.app'
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        localStorage.removeItem('authToken')
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
      localStorage.removeItem('authToken')
    }
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
  }

  const handleSignOut = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setShowDashboard(false)
    setScanResult(null)
  }

  const handleOpenDashboard = () => {
    setShowDashboard(true)
  }

  const handleScan = async () => {
    if (!scanUrl.trim()) {
      setError('Please enter a website URL')
      return
    }

    try {
      setScanning(true)
      setError('')
      setScanResult(null)

      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://web-production-51f3.up.railway.app'
      const response = await fetch(`${baseUrl}/api/scan/premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: scanUrl.trim(),
          max_pages: 10
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      setScanResult(result)
    } catch (err) {
      console.error('Scan failed:', err)
      setError(`Scan failed: ${err.message}`)
    } finally {
      setScanning(false)
    }
  }

  // Show dashboard if user is authenticated and dashboard is requested
  if (showDashboard && user) {
    return <Dashboard user={user} onClose={() => setShowDashboard(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SentryPrime</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#reviews" className="text-gray-600 hover:text-gray-900">Reviews</a>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <UserMenu 
                  user={user} 
                  onSignOut={handleSignOut}
                  onOpenDashboard={handleOpenDashboard}
                />
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Expensive Accessibility Lawsuits{' '}
              <span className="text-blue-600">Before They Start</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive WCAG compliance scanning that protects your business from costly 
              legal action. Get detailed reports and fix issues before they become $75,000+ lawsuits.
            </p>

            {/* Enhanced Multi-Page Scanning Badge */}
            <div className="flex justify-center mb-8">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium">
                🚀 Enhanced Multi-Page Scanning Now Available
              </Badge>
            </div>

            {/* Scan Form */}
            <Card className="max-w-2xl mx-auto mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="url"
                    placeholder="Enter your website URL (e.g., https://example.com)"
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                    className="flex-1"
                    disabled={scanning}
                  />
                  <Button 
                    onClick={handleScan}
                    disabled={scanning}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Start Free Scan
                      </>
                    )}
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Scan Results */}
      {scanResult && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Scan Results for {scanResult.url}</span>
                </CardTitle>
                <CardDescription>
                  Scanned {scanResult.pages_scanned} pages • {scanResult.scan_date}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Violation Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{scanResult.violations?.critical || 0}</div>
                    <div className="text-sm text-red-600">Critical</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{scanResult.violations?.serious || 0}</div>
                    <div className="text-sm text-orange-600">Serious</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{scanResult.violations?.moderate || 0}</div>
                    <div className="text-sm text-yellow-600">Moderate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{scanResult.violations?.minor || 0}</div>
                    <div className="text-sm text-blue-600">Minor</div>
                  </div>
                </div>

                {/* Compliance Score */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {scanResult.compliance_score}% Compliant
                  </div>
                  <div className="text-gray-600">
                    Risk Level: <span className={`font-semibold ${
                      scanResult.risk_level === 'HIGH' ? 'text-red-600' :
                      scanResult.risk_level === 'MODERATE' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {scanResult.risk_level}
                    </span>
                  </div>
                </div>

                {/* Lawsuit Risk */}
                {scanResult.lawsuit_risk && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Lawsuit Risk Assessment</h3>
                    <p className="text-red-700">
                      Estimated potential lawsuit cost: <strong>${scanResult.lawsuit_risk.estimated_cost?.toLocaleString()}</strong>
                    </p>
                    <p className="text-sm text-red-600 mt-1">{scanResult.lawsuit_risk.description}</p>
                  </div>
                )}

                {/* AI Remediation Guide */}
                {scanResult.ai_remediation_guide && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">AI-Powered Remediation Guide</h3>
                    <p className="text-blue-700">{scanResult.ai_remediation_guide}</p>
                  </div>
                )}

                {/* Business Analysis */}
                {scanResult.business_analysis && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Business Impact Analysis</h3>
                    <p className="text-green-700">{scanResult.business_analysis}</p>
                  </div>
                )}

                {/* Call to Action */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 mb-4">
                    Want detailed remediation steps and ongoing monitoring?
                  </p>
                  {user ? (
                    <Button onClick={handleOpenDashboard} className="bg-blue-600 hover:bg-blue-700">
                      View Full Dashboard
                    </Button>
                  ) : (
                    <Button onClick={() => setShowAuthModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      Create Free Account
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>WCAG 2.1 Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-500" />
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span>Trusted by 1000+ businesses</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Website Accessibility Scan Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Search className="h-8 w-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Enhanced Website Accessibility Scan</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive multi-page accessibility analysis with detailed violation reporting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Multi-Page Scanning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Scan up to 100 pages per website to identify accessibility issues across your entire site, 
                  not just the homepage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Detailed Violation Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get comprehensive reports categorizing violations by severity: Critical, Serious, 
                  Moderate, and Minor issues with specific remediation steps.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Legal Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  AI-powered analysis estimates your lawsuit risk and potential costs, 
                  helping you prioritize fixes that matter most for legal compliance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App

