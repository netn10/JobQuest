import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import { SettingsProvider } from '@/contexts/settings-context'
import { UserStatsProvider } from '@/contexts/user-stats-context'
import { NotificationsProvider } from '@/contexts/notifications-context'
import { NotificationStoreProvider } from '@/contexts/notification-store-context'
import { FocusSessionProvider } from '@/contexts/focus-session-context'
import { cleanupBrowserExtensions, preventHydrationMismatch } from '@/utils/hydration-cleanup'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'JobQuest - Focus on Your Career',
  description: 'A comprehensive job search and career development platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize browser extension cleanup
  if (typeof window !== 'undefined') {
    cleanupBrowserExtensions()
    preventHydrationMismatch()
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <UserStatsProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <NotificationStoreProvider>
                  <FocusSessionProvider>
                    <div suppressHydrationWarning>
                      {children}
                    </div>
                    <Toaster />
                  </FocusSessionProvider>
                </NotificationStoreProvider>
              </NotificationsProvider>
            </SettingsProvider>
          </UserStatsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
