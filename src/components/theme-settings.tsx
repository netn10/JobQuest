'use client'

import { useTheme } from '@/contexts/theme-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor }
  ] as const

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon
                return (
                  <Button
                    key={themeOption.id}
                    variant={theme === themeOption.id ? "primary" : "outline"}
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setTheme(themeOption.id as any)}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{themeOption.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}