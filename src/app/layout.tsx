import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthProvider } from '@/contexts/auth-context'
import { SettingsProvider } from '@/contexts/settings-context'
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
    
    // Force all text to be white in dark mode - ULTRA AGGRESSIVE
    const forceWhiteText = () => {
      if (document.documentElement.classList.contains('dark')) {
        const elements = document.querySelectorAll('*:not(svg):not(svg *):not(path):not(circle):not(rect):not(line):not(polygon):not(polyline):not(ellipse)')
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('color', 'white', 'important')
            // Also force any computed styles
            const computedStyle = getComputedStyle(el)
            if (computedStyle.color !== 'rgb(255, 255, 255)' && computedStyle.color !== 'white') {
              el.style.color = 'white !important'
            }
          }
        })
        
        // Also target form elements specifically
        const formElements = document.querySelectorAll('input, select, textarea, option, label, button')
        formElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('color', 'white', 'important')
          }
        })
      }
    }
    
    // Run immediately and on DOM changes
    forceWhiteText()
    const observer = new MutationObserver(forceWhiteText)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['class'] 
    })
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="/force-white-text.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <div suppressHydrationWarning>
                {children}
              </div>
              <Toaster />
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
