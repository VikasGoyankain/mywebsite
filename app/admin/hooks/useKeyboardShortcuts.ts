import { useEffect } from "react"

export function useKeyboardShortcuts(onSectionClick: (sectionId: string) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const shortcuts: Record<string, string> = {
        '1': 'posts',
        '2': 'profile', 
        '3': 'settings',
        '4': 'family',
        '5': 'expertise',
        '6': 'works',
        '7': 'casevault',
        '8': 'url-shortner',
        '9': 'subscribers',
      }

      const sectionId = shortcuts[event.key]
      if (sectionId) {
        event.preventDefault()
        onSectionClick(sectionId)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSectionClick])
} 