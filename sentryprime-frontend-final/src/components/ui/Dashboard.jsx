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

const Dashboard = ({ user, onClose }) => {
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

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken()
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://web-production-51f3.up.railway.app'
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load all dashboard data in parallel
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

  // Add new website
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
        body: JSON.stringify({
          url: newWebsiteUrl.trim(),
          name: newWebsiteName.trim() || undefined
        })
      })

      // Clear form
      setNewWebsiteUrl('')
      setNewWebsiteName('')
      
      // Reload data
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to add website:', err)
      setError(`Failed to add website: ${err.message}`)
    } finally {
      setAddingWebsite(false)
    }
  }

  // Trigger scan for website
  const triggerScan = async (websiteId, url) => {
    try {
      setScanningWebsite(websiteId)
      setError('')

      await apiCall('/api/dashboard/scan', {
        method: 'POST',
        body: JSON.stringify({
          website_id: websiteId,
          url: url
        })
      })

      // Reload data to show new scan
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to trigger scan:', err)
      setError(`Failed to trigger scan: ${err.message}`)
    } finally {
      setScanningWebsite(null)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getComplianceColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'minimal':
      case 'low': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'high':
      case 'extreme': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">SentryPrime Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {user?.first_name || user?.firstName || 'User'}!
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadDashboardData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Back to Scan
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="websites" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Websites</span>
            </TabsTrigger>
            <TabsTrigger value="scans" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Scans</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.overview?.total_websites || 0}</div>
                  <p className="text-xs text-muted-foreground">Active monitoring</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Compliance</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getComplianceColor(dashboardStats?.overview?.avg_compliance_score || 0)}`}>
                    {dashboardStats?.overview?.avg_compliance_score || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Across all sites</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{dashboardStats?.overview?.total_violations || 0}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.overview?.total_scans || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.quick_stats?.scans_this_month || 0} this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Scan Activity</CardTitle>
                  <CardDescription>Latest accessibility scans across your websites</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardStats?.recent_activity?.length > 0 ? (
                      dashboardStats.recent_activity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{activity.website_name}</p>
                            <p className="text-xs text-gray-500">{formatDate(activity.scan_date)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium text-sm ${getComplianceColor(activity.compliance_score)}`}>
                              {activity.compliance_score}% compliant
                            </p>
                            <p className="text-xs text-gray-500">{activity.violations} violations</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No recent scans</p>
                        <p className="text-sm">Add a website and run your first scan</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Key metrics for your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Websites Monitored</span>
                      <span className="font-medium">{dashboardStats?.quick_stats?.websites_monitored || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Scans This Month</span>
                      <span className="font-medium">{dashboardStats?.quick_stats?.scans_this_month || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Pages Per Scan</span>
                      <span className="font-medium">{dashboardStats?.quick_stats?.avg_pages_per_scan || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Scan</span>
                      <span className="font-medium text-sm">
                        {dashboardStats?.quick_stats?.last_scan_date 
                          ? formatDate(dashboardStats.quick_stats.last_scan_date)
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
                <p className="text-gray-600">Manage and monitor your website accessibility</p>
              </div>
            </div>

            {/* Add Website Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Website</CardTitle>
                <CardDescription>Start monitoring a new website for accessibility compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="https://example.com"
                    value={newWebsiteUrl}
                    onChange={(e) => setNewWebsiteUrl(e.target.value)}
                    disabled={addingWebsite}
                  />
                  <Input
                    placeholder="Website Name (optional)"
                    value={newWebsiteName}
                    onChange={(e) => setNewWebsiteName(e.target.value)}
                    disabled={addingWebsite}
                  />
                  <Button onClick={addWebsite} disabled={addingWebsite}>
                    {addingWebsite ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Website
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Websites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.length > 0 ? (
                websites.map((website) => (
                  <Card key={website.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{website.name}</CardTitle>
                        <Badge className={getRiskLevelColor(website.risk_level)}>
                          {website.risk_level || 'Unknown'}
                        </Badge>
                      </div>
                      <CardDescription>{website.url}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Compliance Score</span>
                          <span className={`text-sm font-bold ${getComplianceColor(website.compliance_score || 0)}`}>
                            {website.compliance_score || 0}%
                          </span>
                        </div>
                        <Progress value={website.compliance_score || 0} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Scans</p>
                          <p className="font-medium">{website.total_scans || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Violations</p>
                          <p className="font-medium text-red-600">{website.total_violations || 0}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => triggerScan(website.id, website.url)}
                          disabled={scanningWebsite === website.id}
                        >
                          {scanningWebsite === website.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4 mr-1" />
                          )}
                          Scan Now
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500">
                        Last scan: {website.last_scan_date ? formatDate(website.last_scan_date) : 'Never'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No websites yet</h3>
                  <p className="text-gray-600 mb-4">Add your first website to start monitoring accessibility compliance</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Scans Tab */}
          <TabsContent value="scans" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scan History</h2>
                <p className="text-gray-600">View all your accessibility scan results</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {scans.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Website
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Compliance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Violations
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scans.map((scan) => (
                          <tr key={scan.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{scan.website_name}</div>
                                <div className="text-sm text-gray-500">{scan.url}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(scan.scan_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${getComplianceColor(scan.compliance_score)}`}>
                                {scan.compliance_score}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{scan.total_violations} total</div>
                              <div className="text-xs text-gray-500">
                                {scan.serious_violations} serious, {scan.moderate_violations} moderate
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getRiskLevelColor(scan.risk_level)}>
                                {scan.risk_level}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet</h3>
                    <p className="text-gray-600 mb-4">Run your first accessibility scan to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Coming Soon</h3>
              <p className="text-gray-600">Detailed compliance reports and remediation guides will be available here</p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-600">
                    {user?.first_name} {user?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-sm text-gray-600">
                    {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard

