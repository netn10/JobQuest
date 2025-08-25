'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from './button'
import { Input } from './input'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  disabled?: boolean
}

export function ColorPicker({ value, onChange, label, disabled = false }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempColor, setTempColor] = useState(value)
  const [colorType, setColorType] = useState<'hex' | 'rgb' | 'hsl'>('hex')
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTempColor(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }).join("")
  }

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return null

    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const getColorDisplay = () => {
    switch (colorType) {
      case 'rgb':
        const rgb = hexToRgb(tempColor)
        return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : tempColor
      case 'hsl':
        const hsl = hexToHsl(tempColor)
        return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : tempColor
      default:
        return tempColor
    }
  }

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#374151',
    '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#ffffff',
    '#000000', '#1f2937', '#111827', '#0f172a', '#991b1b', '#9a3412'
  ]

  return (
    <div className="relative" ref={pickerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-12 h-10 rounded-md border-2 border-gray-300 dark:border-gray-600 
            transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          `}
          style={{ backgroundColor: tempColor }}
          title={`Current color: ${tempColor}`}
        />
        
        <Input
          type="text"
          value={getColorDisplay()}
          onChange={(e) => {
            setTempColor(e.target.value)
            if (e.target.value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
              onChange(e.target.value)
            }
          }}
          disabled={disabled}
          className="flex-1"
          placeholder="#000000"
        />
        
        <select
          value={colorType}
          onChange={(e) => setColorType(e.target.value as 'hex' | 'rgb' | 'hsl')}
          disabled={disabled}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[300px]">
          <div className="space-y-4">
            {/* Native color input */}
            <div>
              <input
                type="color"
                value={tempColor}
                onChange={(e) => {
                  setTempColor(e.target.value)
                  onChange(e.target.value)
                }}
                className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
              />
            </div>

            {/* Preset colors */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preset Colors</p>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setTempColor(color)
                      onChange(color)
                    }}
                    className={`
                      w-8 h-8 rounded border-2 transition-all duration-200 hover:scale-110
                      ${tempColor === color 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Color input field */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                onBlur={() => {
                  if (tempColor.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                    onChange(tempColor)
                  } else {
                    setTempColor(value)
                  }
                }}
                placeholder="#000000"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (tempColor.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                    onChange(tempColor)
                    setIsOpen(false)
                  }
                }}
              >
                Apply
              </Button>
            </div>

            {/* Recent colors */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Value</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: value }}
                />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{value}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}