'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Palette } from 'lucide-react'

const themes = [
  { name: 'light', label: 'Claro', icon: Sun },
  { name: 'dark', label: 'Oscuro', icon: Moon },
  { name: 'tweakcn-modern', label: 'Moderno', icon: Palette },
]

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('light')
  
  useEffect(() => {
    // Check for theme in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const themeParam = urlParams.get('theme')
    
    if (themeParam && themes.some(t => t.name === themeParam)) {
      setCurrentTheme(themeParam)
      document.documentElement.setAttribute('data-theme', themeParam)
    } else {
      // Check for saved theme in localStorage
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme && themes.some(t => t.name === savedTheme)) {
        setCurrentTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)
      }
    }
  }, [])
  
  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.name === currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    
    setCurrentTheme(nextTheme.name)
    document.documentElement.setAttribute('data-theme', nextTheme.name)
    localStorage.setItem('theme', nextTheme.name)
    
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('theme', nextTheme.name)
    window.history.replaceState({}, '', url.toString())
  }
  
  const currentThemeInfo = themes.find(t => t.name === currentTheme) || themes[0]
  const Icon = currentThemeInfo.icon
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9"
      title={`Cambiar tema (actual: ${currentThemeInfo.label})`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
