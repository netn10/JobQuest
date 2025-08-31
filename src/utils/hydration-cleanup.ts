// Safer utility to handle browser extension modifications after React hydration
export function cleanupBrowserExtensions() {
  if (typeof window === 'undefined') return

  // Remove common browser extension attributes
  const removeExtensionAttributes = () => {
    const elements = document.querySelectorAll('*')
    elements.forEach(element => {
      // Remove common browser extension attributes
      element.removeAttribute('bis_skin_checked')
      element.removeAttribute('data-bis_skin_checked')
      element.removeAttribute('data-adblockkey')
      element.removeAttribute('data-adblock')
    })
  }

  // Only run cleanup after React has hydrated (safer timing)
  // Use a longer delay to ensure React hydration is complete
  setTimeout(() => {
    removeExtensionAttributes()
    // Run cleanup less frequently to avoid interfering with React updates
    setInterval(removeExtensionAttributes, 5000)
  }, 2000)
}

// Prevent hydration mismatches from browser extensions - DISABLED for safety
export function preventHydrationMismatch() {
  // Temporarily disabled as it was interfering with React event handling
  // The setAttribute override was preventing proper event binding
  return
}
