// Utility to clean up browser extension modifications
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

  // Run cleanup after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeExtensionAttributes)
  } else {
    removeExtensionAttributes()
  }

  // Also run cleanup periodically to catch dynamic additions
  setInterval(removeExtensionAttributes, 1000)
}

// Prevent hydration mismatches from browser extensions
export function preventHydrationMismatch() {
  if (typeof window === 'undefined') return

  // Override common browser extension modifications
  const originalSetAttribute = Element.prototype.setAttribute
  Element.prototype.setAttribute = function(name: string, value: string) {
    // Block common browser extension attributes
    if (name.includes('bis_skin_checked') || name.includes('adblock')) {
      return
    }
    return originalSetAttribute.call(this, name, value)
  }
}
