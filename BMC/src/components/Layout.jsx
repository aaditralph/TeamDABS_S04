import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ClipboardList, 
  CheckCircle, 
  Bell, 
  LogOut, 
  Shield,
  Menu,
  X
} from 'lucide-react'

const Layout = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pending-reports', label: 'Pending Reports', icon: ClipboardList, badge: 'count' },
    { path: '/reviewed-reports', label: 'Reviewed', icon: CheckCircle },
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-sidebar text-white flex flex-col z-40 transition-transform duration-300`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">BMC Officer</h1>
              <p className="text-xs text-gray-400">Verification Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && item.badge === 'count' && (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  15
                </span>
              )}
              {item.badge && typeof item.badge === 'number' && item.badge > 0 && (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">{user?.name?.charAt(0) || 'O'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Officer'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'officer@bmc.gov'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-400 hover:text-white w-full px-4 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-8 py-4 lg:ml-0">
          <div className="flex items-center justify-between ml-12 lg:ml-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {location.pathname === '/' && 'Dashboard'}
                {location.pathname === '/pending-reports' && 'Pending Reports'}
                {location.pathname === '/reviewed-reports' && 'Reviewed Reports'}
                {location.pathname === '/notifications' && 'Notifications'}
                {location.pathname.startsWith('/report/') && 'Report Details'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-primary transition-colors rounded-lg hover:bg-gray-100">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
                )}
              </button>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  Officer
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
