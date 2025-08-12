import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { User, LogOut } from 'lucide-react'

const UserMenu = ({ user, onSignOut, onOpenDashboard }) => {
  if (!user) return null

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {user.first_name} {user.last_name}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onOpenDashboard}
        className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
      >
        Dashboard
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onSignOut}
        className="text-gray-600 hover:text-gray-800"
      >
        <LogOut className="h-4 w-4 mr-1" />
        Sign Out
      </Button>
    </div>
  )
}

export default UserMenu

