export interface ThemeSection {
  id: string
  name: string
  description: string
  properties: ThemeProperty[]
}

export interface ThemeProperty {
  id: string
  name: string
  cssVar: string
  category: 'color' | 'size' | 'spacing'
  defaultLight: string
  defaultDark: string
}

export const themeConfig: ThemeSection[] = [
  {
    id: 'background',
    name: 'Background Colors',
    description: 'Primary and secondary background colors',
    properties: [
      {
        id: 'primary-bg',
        name: 'Primary Background',
        cssVar: '--background-primary',
        category: 'color',
        defaultLight: '#ffffff',
        defaultDark: '#0a0a0a'
      },
      {
        id: 'secondary-bg',
        name: 'Secondary Background',
        cssVar: '--background-secondary',
        category: 'color',
        defaultLight: '#f8f9fa',
        defaultDark: '#1f2937'
      },
      {
        id: 'tertiary-bg',
        name: 'Tertiary Background',
        cssVar: '--background-tertiary',
        category: 'color',
        defaultLight: '#f1f5f9',
        defaultDark: '#374151'
      },
      {
        id: 'card-bg',
        name: 'Card Background',
        cssVar: '--background-card',
        category: 'color',
        defaultLight: '#ffffff',
        defaultDark: '#1f2937'
      },
      {
        id: 'modal-bg',
        name: 'Modal Background',
        cssVar: '--background-modal',
        category: 'color',
        defaultLight: '#ffffff',
        defaultDark: '#1f2937'
      }
    ]
  },
  {
    id: 'text',
    name: 'Text Colors',
    description: 'All text color variations',
    properties: [
      {
        id: 'text-primary',
        name: 'Primary Text',
        cssVar: '--text-primary',
        category: 'color',
        defaultLight: '#111827',
        defaultDark: '#f9fafb'
      },
      {
        id: 'text-secondary',
        name: 'Secondary Text',
        cssVar: '--text-secondary',
        category: 'color',
        defaultLight: '#6b7280',
        defaultDark: '#d1d5db'
      },
      {
        id: 'text-muted',
        name: 'Muted Text',
        cssVar: '--text-muted',
        category: 'color',
        defaultLight: '#9ca3af',
        defaultDark: '#9ca3af'
      },
      {
        id: 'text-accent',
        name: 'Accent Text',
        cssVar: '--text-accent',
        category: 'color',
        defaultLight: '#3b82f6',
        defaultDark: '#60a5fa'
      }
    ]
  },
  {
    id: 'borders',
    name: 'Border Colors',
    description: 'Border and divider colors',
    properties: [
      {
        id: 'border-primary',
        name: 'Primary Border',
        cssVar: '--border-primary',
        category: 'color',
        defaultLight: '#e5e7eb',
        defaultDark: '#4b5563'
      },
      {
        id: 'border-secondary',
        name: 'Secondary Border',
        cssVar: '--border-secondary',
        category: 'color',
        defaultLight: '#d1d5db',
        defaultDark: '#374151'
      },
      {
        id: 'border-focus',
        name: 'Focus Border',
        cssVar: '--border-focus',
        category: 'color',
        defaultLight: '#3b82f6',
        defaultDark: '#60a5fa'
      }
    ]
  },
  {
    id: 'buttons',
    name: 'Button Colors',
    description: 'Primary and secondary button styles',
    properties: [
      {
        id: 'button-primary-bg',
        name: 'Primary Button Background',
        cssVar: '--button-primary-bg',
        category: 'color',
        defaultLight: '#3b82f6',
        defaultDark: '#3b82f6'
      },
      {
        id: 'button-primary-text',
        name: 'Primary Button Text',
        cssVar: '--button-primary-text',
        category: 'color',
        defaultLight: '#ffffff',
        defaultDark: '#ffffff'
      },
      {
        id: 'button-primary-hover',
        name: 'Primary Button Hover',
        cssVar: '--button-primary-hover',
        category: 'color',
        defaultLight: '#2563eb',
        defaultDark: '#2563eb'
      },
      {
        id: 'button-secondary-bg',
        name: 'Secondary Button Background',
        cssVar: '--button-secondary-bg',
        category: 'color',
        defaultLight: '#f3f4f6',
        defaultDark: '#374151'
      },
      {
        id: 'button-secondary-text',
        name: 'Secondary Button Text',
        cssVar: '--button-secondary-text',
        category: 'color',
        defaultLight: '#374151',
        defaultDark: '#d1d5db'
      }
    ]
  },
  {
    id: 'accent',
    name: 'Accent Colors',
    description: 'Brand and accent colors used throughout the app',
    properties: [
      {
        id: 'accent-primary',
        name: 'Primary Accent',
        cssVar: '--accent-primary',
        category: 'color',
        defaultLight: '#3b82f6',
        defaultDark: '#60a5fa'
      },
      {
        id: 'accent-secondary',
        name: 'Secondary Accent',
        cssVar: '--accent-secondary',
        category: 'color',
        defaultLight: '#8b5cf6',
        defaultDark: '#a78bfa'
      },
      {
        id: 'accent-success',
        name: 'Success Color',
        cssVar: '--accent-success',
        category: 'color',
        defaultLight: '#10b981',
        defaultDark: '#34d399'
      },
      {
        id: 'accent-warning',
        name: 'Warning Color',
        cssVar: '--accent-warning',
        category: 'color',
        defaultLight: '#f59e0b',
        defaultDark: '#fbbf24'
      },
      {
        id: 'accent-error',
        name: 'Error Color',
        cssVar: '--accent-error',
        category: 'color',
        defaultLight: '#ef4444',
        defaultDark: '#f87171'
      }
    ]
  },
  {
    id: 'stats',
    name: 'Statistics Colors',
    description: 'Colors for XP, levels, and achievements',
    properties: [
      {
        id: 'xp-color',
        name: 'XP Color',
        cssVar: '--xp-color',
        category: 'color',
        defaultLight: '#eab308',
        defaultDark: '#facc15'
      },
      {
        id: 'level-color',
        name: 'Level Color',
        cssVar: '--level-color',
        category: 'color',
        defaultLight: '#3b82f6',
        defaultDark: '#60a5fa'
      },
      {
        id: 'streak-color',
        name: 'Streak Color',
        cssVar: '--streak-color',
        category: 'color',
        defaultLight: '#10b981',
        defaultDark: '#34d399'
      },
      {
        id: 'trophy-color',
        name: 'Trophy Color',
        cssVar: '--trophy-color',
        category: 'color',
        defaultLight: '#eab308',
        defaultDark: '#facc15'
      },
      {
        id: 'application-color',
        name: 'Application Color',
        cssVar: '--application-color',
        category: 'color',
        defaultLight: '#8b5cf6',
        defaultDark: '#a78bfa'
      }
    ]
  }
]

export interface CustomTheme {
  id: string
  name: string
  baseTheme: 'light' | 'dark'
  customizations: Record<string, string>
}

export const presetThemes: CustomTheme[] = [
  {
    id: 'default-light',
    name: 'Default Light',
    baseTheme: 'light',
    customizations: {}
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    baseTheme: 'dark',
    customizations: {}
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    baseTheme: 'light',
    customizations: {
      '--accent-primary': '#0ea5e9',
      '--accent-secondary': '#06b6d4',
      '--button-primary-bg': '#0ea5e9',
      '--button-primary-hover': '#0284c7',
      '--level-color': '#0ea5e9'
    }
  },
  {
    id: 'sunset-red',
    name: 'Sunset Red',
    baseTheme: 'light',
    customizations: {
      '--accent-primary': '#dc2626',
      '--accent-secondary': '#f97316',
      '--button-primary-bg': '#dc2626',
      '--button-primary-hover': '#b91c1c',
      '--level-color': '#dc2626'
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    baseTheme: 'light',
    customizations: {
      '--accent-primary': '#059669',
      '--accent-secondary': '#10b981',
      '--button-primary-bg': '#059669',
      '--button-primary-hover': '#047857',
      '--level-color': '#059669',
      '--streak-color': '#10b981'
    }
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    baseTheme: 'dark',
    customizations: {
      '--accent-primary': '#7c3aed',
      '--accent-secondary': '#a855f7',
      '--button-primary-bg': '#7c3aed',
      '--button-primary-hover': '#6d28d9',
      '--level-color': '#7c3aed',
      '--application-color': '#a855f7'
    }
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    baseTheme: 'dark',
    customizations: {
      '--background-primary': '#0f172a',
      '--background-secondary': '#1e293b',
      '--background-tertiary': '#334155',
      '--background-card': '#1e293b',
      '--accent-primary': '#0ea5e9',
      '--accent-secondary': '#06b6d4'
    }
  }
]