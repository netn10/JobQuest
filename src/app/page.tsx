'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import LandingPage from '@/components/pages/landing-page'
import DashboardPage from '@/components/pages/dashboard-page'
import LoginPage from '@/components/pages/login-page'
import RegisterPage from '@/components/pages/register-page'
import JobsPage from '@/components/pages/jobs-page'
import LearningPage from '@/components/pages/learning-page'
import MissionsPage from '@/components/pages/missions-page'
import SettingsPage from '@/components/pages/settings-page'
import AboutPage from '@/components/pages/about-page'
import AchievementsPage from '@/components/pages/achievements-page'
import NotebookPage from '@/components/pages/notebook-page'

type Route = 
  | 'landing'
  | 'dashboard'
  | 'login'
  | 'register'
  | 'jobs'
  | 'learning'
  | 'missions'
  | 'settings'
  | 'about'
  | 'achievements'
  | 'notebook'

export default function App() {
  const { user, loading } = useAuth()
  const [currentRoute, setCurrentRoute] = useState<Route>('landing')
  const [routeHistory, setRouteHistory] = useState<Route[]>(['landing'])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || 'landing'
      if (isValidRoute(path as Route)) {
        setCurrentRoute(path as Route)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Handle initial route based on auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        navigateTo('dashboard')
      } else {
        navigateTo('landing')
      }
    }
  }, [user, loading])

  const isValidRoute = (route: string): route is Route => {
    return ['landing', 'dashboard', 'login', 'register', 'jobs', 'learning', 'missions', 'settings', 'about', 'achievements', 'notebook'].includes(route)
  }

  const navigateTo = (route: Route) => {
    setCurrentRoute(route)
    setRouteHistory(prev => [...prev, route])
    
    // Update URL without page reload
    const url = route === 'landing' ? '/' : `/${route}`
    window.history.pushState({ route }, '', url)
  }

  // Navigation function to pass to components
  const navigate = (route: string) => {
    if (isValidRoute(route)) {
      navigateTo(route as Route)
    }
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Render the appropriate page based on current route
  switch (currentRoute) {
    case 'landing':
      return <LandingPage navigate={navigate} />
    case 'dashboard':
      return <DashboardPage navigate={navigate} />
    case 'login':
      return <LoginPage navigate={navigate} />
    case 'register':
      return <RegisterPage navigate={navigate} />
    case 'jobs':
      return <JobsPage navigate={navigate} />
    case 'learning':
      return <LearningPage navigate={navigate} />
    case 'missions':
      return <MissionsPage navigate={navigate} />
    case 'settings':
      return <SettingsPage navigate={navigate} />
    case 'about':
      return <AboutPage navigate={navigate} />
    case 'achievements':
      return <AchievementsPage navigate={navigate} />
    case 'notebook':
      return <NotebookPage navigate={navigate} />
    default:
      return <LandingPage navigate={navigate} />
  }
}