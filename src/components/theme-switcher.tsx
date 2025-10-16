'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

const themes = [
  { name: 'light', label: 'Light', icon: Sun },
  { name: 'dark', label: 'Dark', icon: Moon },
]

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('light')
  
  useEffect(() => {
    // Check for theme in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const themeParam = urlParams.get('theme')
    
    if (themeParam && themes.some(t => t.name === themeParam)) {
      setCurrentTheme(themeParam)
      applyTheme(themeParam)
    } else {
      // Check for saved theme in localStorage
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme && themes.some(t => t.name === savedTheme)) {
        setCurrentTheme(savedTheme)
        applyTheme(savedTheme)
      }
    }
  }, [])
  
  const applyTheme = (themeName: string) => {
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.name === currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    
    setCurrentTheme(nextTheme.name)
    applyTheme(nextTheme.name)
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
      className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
      title={`Switch theme (current: ${currentThemeInfo.label})`}
    >
      <Icon className="h-4 w-4 text-white" />
      <span className="sr-only">Switch theme</span>
    </Button>
  )
}