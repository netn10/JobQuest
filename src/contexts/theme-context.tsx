'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { themeConfig, presetThemes, type CustomTheme } from '@/lib/theme-config'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  customTheme: CustomTheme | null
  setCustomTheme: (theme: CustomTheme | null) => void
  updateThemeProperty: (cssVar: string, value: string) => void
  resetTheme: () => void
  applyPresetTheme: (presetId: string) => void
  saveCustomTheme: (name: string) => void
  customThemes: CustomTheme[]
  deleteCustomTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null)
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
    
    // Load custom theme and custom themes list
    const savedCustomTheme = localStorage.getItem('customTheme')
    if (savedCustomTheme) {
      try {
        setCustomTheme(JSON.parse(savedCustomTheme))
      } catch (e) {
        console.warn('Failed to parse custom theme from localStorage')
      }
    }
    
    const savedCustomThemes = localStorage.getItem('customThemes')
    if (savedCustomThemes) {
      try {
        setCustomThemes(JSON.parse(savedCustomThemes))
      } catch (e) {
        console.warn('Failed to parse custom themes from localStorage')
      }
    }
  }, [])

  const applyThemeProperties = useCallback((resolved: 'light' | 'dark', theme: CustomTheme | null) => {
    const root = document.documentElement
    
    // Clear all existing custom properties
    themeConfig.forEach(section => {
      section.properties.forEach(property => {
        root.style.removeProperty(property.cssVar)
      })
    })
    
    // Apply default theme properties
    themeConfig.forEach(section => {
      section.properties.forEach(property => {
        const defaultValue = resolved === 'dark' ? property.defaultDark : property.defaultLight
        root.style.setProperty(property.cssVar, defaultValue)
      })
    })
    
    // Apply custom theme overrides
    if (theme) {
      Object.entries(theme.customizations).forEach(([cssVar, value]) => {
        root.style.setProperty(cssVar, value)
      })
    }
    
    // Legacy properties for backward compatibility
    const primaryBg = root.style.getPropertyValue('--background-primary') || (resolved === 'dark' ? '#0a0a0a' : '#ffffff')
    const primaryText = root.style.getPropertyValue('--text-primary') || (resolved === 'dark' ? '#ededed' : '#171717')
    root.style.setProperty('--background', primaryBg)
    root.style.setProperty('--foreground', primaryText)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Save theme to localStorage
    localStorage.setItem('theme', theme)
    
    // Save custom theme to localStorage
    if (customTheme) {
      localStorage.setItem('customTheme', JSON.stringify(customTheme))
    } else {
      localStorage.removeItem('customTheme')
    }

    // Determine resolved theme
    let resolved: 'light' | 'dark'
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      resolved = theme
    }

    setResolvedTheme(resolved)

    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    
    // Apply all theme properties
    applyThemeProperties(resolved, customTheme)
  }, [theme, customTheme, mounted, applyThemeProperties])

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const resolved = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
      
      applyThemeProperties(resolved, customTheme)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted, customTheme, applyThemeProperties])
  
  // Theme manipulation functions
  const updateThemeProperty = useCallback((cssVar: string, value: string) => {
    if (!customTheme) {
      // Create new custom theme based on current resolved theme
      const newCustomTheme: CustomTheme = {
        id: `custom-${Date.now()}`,
        name: `Custom ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}`,
        baseTheme: resolvedTheme,
        customizations: { [cssVar]: value }
      }
      setCustomTheme(newCustomTheme)
    } else {
      // Update existing custom theme
      const updatedTheme = {
        ...customTheme,
        customizations: {
          ...customTheme.customizations,
          [cssVar]: value
        }
      }
      setCustomTheme(updatedTheme)
    }
  }, [customTheme, resolvedTheme])
  
  const resetTheme = useCallback(() => {
    setCustomTheme(null)
  }, [])
  
  const applyPresetTheme = useCallback((presetId: string) => {
    const preset = [...presetThemes, ...customThemes].find(t => t.id === presetId)
    if (preset) {
      setCustomTheme(preset)
      // Also update base theme if needed
      if (theme !== 'system' && theme !== preset.baseTheme) {
        setTheme(preset.baseTheme)
      }
    }
  }, [customThemes, theme])
  
  const saveCustomTheme = useCallback((name: string) => {
    if (!customTheme) return
    
    const savedTheme: CustomTheme = {
      ...customTheme,
      id: `custom-${Date.now()}`,
      name
    }
    
    const updatedCustomThemes = [...customThemes, savedTheme]
    setCustomThemes(updatedCustomThemes)
    localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes))
  }, [customTheme, customThemes])
  
  const deleteCustomTheme = useCallback((id: string) => {
    const updatedCustomThemes = customThemes.filter(t => t.id !== id)
    setCustomThemes(updatedCustomThemes)
    localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes))
    
    // If we're currently using the deleted theme, reset to default
    if (customTheme && customTheme.id === id) {
      setCustomTheme(null)
    }
  }, [customThemes, customTheme])

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ 
        theme, 
        setTheme, 
        resolvedTheme,
        customTheme: null,
        setCustomTheme: () => {},
        updateThemeProperty: () => {},
        resetTheme: () => {},
        applyPresetTheme: () => {},
        saveCustomTheme: () => {},
        customThemes: [],
        deleteCustomTheme: () => {}
      }}>
        <div suppressHydrationWarning>
          {children}
        </div>
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      resolvedTheme,
      customTheme,
      setCustomTheme,
      updateThemeProperty,
      resetTheme,
      applyPresetTheme,
      saveCustomTheme,
      customThemes,
      deleteCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}