'use client'

import React, { useState } from 'react'
import { useTheme } from '@/contexts/theme-context'
import { themeConfig, presetThemes, type CustomTheme } from '@/lib/theme-config'
import { ColorPicker } from '@/components/ui/color-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  RotateCcw, 
  Save, 
  Trash2, 
  Download, 
  Upload, 
  Eye, 
  Copy,
  Check
} from 'lucide-react'

export function ThemeSettings() {
  const {
    theme,
    setTheme,
    customTheme,
    updateThemeProperty,
    resetTheme,
    applyPresetTheme,
    saveCustomTheme,
    customThemes,
    deleteCustomTheme
  } = useTheme()
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [customThemeName, setCustomThemeName] = useState('')
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const getCurrentValue = (cssVar: string, defaultValue: string) => {
    if (typeof window !== 'undefined') {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(cssVar)
      return computed.trim() || defaultValue
    }
    return defaultValue
  }

  const handleSaveTheme = () => {
    if (customThemeName.trim()) {
      saveCustomTheme(customThemeName.trim())
      setCustomThemeName('')
      setSaveDialogOpen(false)
    }
  }

  const handleExportTheme = () => {
    if (!customTheme) return
    
    const dataStr = JSON.stringify(customTheme, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${customTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string) as CustomTheme
        // Validate theme structure
        if (theme.id && theme.name && theme.baseTheme && theme.customizations) {
          applyPresetTheme(theme.id)
        }
      } catch (error) {
        console.error('Failed to import theme:', error)
        alert('Failed to import theme. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates({ ...copiedStates, [key]: true })
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Theme Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Customize every color in your interface</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetTheme}
            disabled={!customTheme}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!customTheme}>
                <Save className="h-4 w-4 mr-2" />
                Save Theme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Custom Theme</DialogTitle>
                <DialogDescription>
                  Give your theme a name to save it for future use.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="theme-name">Theme Name</Label>
                  <Input
                    id="theme-name"
                    value={customThemeName}
                    onChange={(e) => setCustomThemeName(e.target.value)}
                    placeholder="My Awesome Theme"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTheme} disabled={!customThemeName.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Base Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Base Theme</CardTitle>
          <CardDescription>Choose between light, dark, or system preference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark', 'system'] as const).map((themeOption) => (
              <Button
                key={themeOption}
                variant={theme === themeOption ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme(themeOption)}
                className="capitalize"
              >
                {themeOption}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="customize" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        {/* Customize Tab */}
        <TabsContent value="customize" className="space-y-6">
          {themeConfig.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {section.name}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.properties.map((property) => {
                    const currentValue = getCurrentValue(property.cssVar, property.defaultLight)
                    return (
                      <div key={property.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{property.name}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(currentValue, property.id)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedStates[property.id] ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <ColorPicker
                          value={currentValue}
                          onChange={(value) => updateThemeProperty(property.cssVar, value)}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {property.cssVar}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Built-in Themes</CardTitle>
              <CardDescription>Professional themes ready to use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presetThemes.map((preset) => (
                  <div key={preset.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{preset.name}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full capitalize">
                        {preset.baseTheme}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {Object.values(preset.customizations).slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      {Object.values(preset.customizations).length > 5 && (
                        <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{Object.values(preset.customizations).length - 5}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPresetTheme(preset.id)}
                      className="w-full"
                    >
                      Apply Theme
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {customThemes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Custom Themes</CardTitle>
                <CardDescription>Themes you've created and saved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customThemes.map((theme) => (
                    <div key={theme.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{theme.name}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full capitalize">
                          {theme.baseTheme}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {Object.values(theme.customizations).slice(0, 5).map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyPresetTheme(theme.id)}
                          className="flex-1"
                        >
                          Apply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCustomTheme(theme.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export</CardTitle>
              <CardDescription>Share themes or backup your customizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handleExportTheme}
                  disabled={!customTheme}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Current Theme
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportTheme}
                    className="hidden"
                    id="theme-import"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('theme-import')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Theme
                  </Button>
                </div>
              </div>
              
              {customTheme && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Theme</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(customTheme, null, 2), 'current-theme')}
                    >
                      {copiedStates['current-theme'] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{customTheme.name}</strong> - {Object.keys(customTheme.customizations).length} customizations
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {customThemes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Saved Themes</CardTitle>
                <CardDescription>Delete or organize your custom themes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customThemes.map((theme) => (
                    <div key={theme.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {Object.keys(theme.customizations).length} customizations • {theme.baseTheme}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCustomTheme(theme.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}