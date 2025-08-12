import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  User, 
  Globe, 
  FileText, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  Plus,
  Search,
  Eye,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react'

const Dashboard = ({ user, onLogout }) => { // Changed onClose to onLogout for clarity
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState(null)
  const [websites, setWebsites] = useState([])
  const [scans, setScans] = useState([])
  
  // State for forms
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('')
  const [newWebsiteName, setNewWebsiteName] = useState('')
  const [addingWebsite, setAddingWebsite] = useState(false)
  const [scanningWebsite, setScanningWebsite] = useState(null)

  const getAuthToken = () => localStorage.getItem('authToken')

  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken()
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://sentryprime-backend-clean-production.up.railway.app'
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    } )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const [statsData, websitesData, scansData] = await Promise.all([
        apiCall('/api/dashboard/stats'),
        apiCall('/api/dashboard/websites'),
        apiCall('/api/dashboard/scans')
      ])
      setDashboardStats(statsData)
      setWebsites(websitesData.websites || [])
      setScans(scansData.scans || [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(`Failed to load dashboard data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addWebsite = async () => {
    if (!newWebsiteUrl.trim()) {
      setError('Please enter a website URL')
      return
    }
    try {
      setAddingWebsite(true)
      setError('')
      await apiCall('/api/dashboard/websites', {
        method: 'POST',
        body: JSON.stringify({ url: newWebsiteUrl.trim(), name: newWebsiteName.trim() || undefined })
      })
      setNewWebsiteUrl('')
      setNewWebsiteName('')
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to add website:', err)
      setError(`Failed to add website: ${err.message}`)
    } finally {
      setAddingWebsite(false)
    }
  }

  const triggerScan = async (websiteId, url) => {
    try {
      setScanningWebsite(websiteId)
      setError('')
      await apiCall('/api/dashboard/scan', {
        method: 'POST',
        body: JSON.stringify({ website_id: websiteId, url: url })
      })
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to trigger scan:', err)
      setError(`Failed to trigger scan: ${err.message}`)
    } finally {
      setScanningWebsite(null)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getComplianceColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">SentryPrime Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user?.firstName || 'User'}!
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="scans">Scans</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader><CardTitle>Total Websites</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{dashboardStats?.overview?.total_websites || 0}</div></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Avg. Compliance</CardTitle></CardHeader>
                <CardContent><div className={`text-2xl font-bold ${getComplianceColor(dashboardStats?.overview?.avg_compliance_score || 0)}`}>{dashboardStats?.overview?.avg_compliance_score || 0}%</div></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Total Violations</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-red-600">{dashboardStats?.overview?.total_violations || 0}</div></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Total Scans</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{dashboardStats?.overview?.total_scans || 0}</div></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="websites" className="space-y-6">
            {/* Add Website Form */}
            <Card>
              <CardHeader><CardTitle>Add New Website</CardTitle></CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input placeholder="https://example.com" value={newWebsiteUrl} onChange={(e ) => setNewWebsiteUrl(e.target.value)} disabled={addingWebsite} />
                  <Input placeholder="Website Name (optional)" value={newWebsiteName} onChange={(e) => setNewWebsiteName(e.target.value)} disabled={addingWebsite} />
                  <Button onClick={addWebsite} disabled={addingWebsite}>
                    {addingWebsite ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Website'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Websites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website) => (
                <Card key={website.id}>
                  <CardHeader>
                    <CardTitle>{website.name}</CardTitle>
                    <CardDescription>{website.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>Compliance: {website.compliance_score}%</p>
                    <p>Violations: {website.total_violations}</p>
                    <p>Last Scan: {website.last_scan_date ? formatDate(website.last_scan_date) : 'Never'}</p>
                    <Button onClick={() => triggerScan(website.id, website.url)} disabled={scanningWebsite === website.id}>
                      {scanningWebsite === website.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="scans">
             {/* Scans Table */}
             <Card>
              <CardHeader><CardTitle>Scan History</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Website</th>
                      <th className="text-left">Date</th>
                      <th className="text-left">Violations</th>
                      <th className="text-left">Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((scan) => (
                      <tr key={scan.id}>
                        <td>{scan.website_name}</td>
                        <td>{formatDate(scan.scan_date)}</td>
                        <td>{scan.total_violations}</td>
                        <td>{scan.compliance_score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard
