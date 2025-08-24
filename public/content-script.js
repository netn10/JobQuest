// Content script for JobQuest Focus Blocker
let isFocusActive = false
let blockedSites = []
let blockedApps = []
let focusStartTime = null
let focusDuration = null

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FOCUS_START') {
    isFocusActive = true
    blockedSites = message.blockedWebsites || []
    blockedApps = message.blockedApps || []
    focusStartTime = message.startTime || Date.now()
    focusDuration = message.duration || null
    console.log('Focus session started in content script:', { blockedSites, focusDuration })
    
    // Check if current page should be blocked
    checkCurrentPage()
  } else if (message.type === 'FOCUS_STOP') {
    isFocusActive = false
    blockedSites = []
    blockedApps = []
    focusStartTime = null
    focusDuration = null
    console.log('Focus session stopped in content script')
    
    // Remove any blocking overlays
    removeBlockingOverlay()
  }
})

// Check if current page should be blocked
function checkCurrentPage() {
  if (!isFocusActive || !blockedSites.length) return
  
  const currentHostname = window.location.hostname
  const isBlocked = blockedSites.some(site => {
    const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
    const cleanHostname = currentHostname.replace(/^www\./, '')
    return cleanHostname.includes(cleanSite) || cleanSite.includes(cleanHostname)
  })
  
  if (isBlocked) {
    showBlockingOverlay()
  }
}

// Show blocking overlay
function showBlockingOverlay() {
  // Remove existing overlay if any
  removeBlockingOverlay()
  
  const overlay = document.createElement('div')
  overlay.id = 'jobquest-focus-blocker-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `
  
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }
  
  const getRemainingTime = () => {
    if (!focusStartTime || !focusDuration) return 0
    const elapsed = Math.floor((Date.now() - focusStartTime) / 1000 / 60)
    return Math.max(0, focusDuration - elapsed)
  }
  
  const getProgress = () => {
    if (!focusDuration) return 0
    const remaining = getRemainingTime()
    return Math.max(0, Math.min(100, ((focusDuration - remaining) / focusDuration) * 100))
  }
  
  const remainingTime = getRemainingTime()
  const progress = getProgress()
  
  overlay.innerHTML = `
    <div style="
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      max-width: 500px;
      margin: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    ">
      <div style="font-size: 4rem; margin-bottom: 1rem; animation: pulse 2s infinite;">🚫</div>
      <h1 style="
        color: white;
        margin-bottom: 1rem;
        font-size: 2rem;
        font-weight: 700;
      ">Site Blocked</h1>
      <p style="
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 1rem;
        line-height: 1.6;
      ">This website is blocked during your focus session. Please complete your mission first to regain access.</p>
      
      ${remainingTime > 0 ? `
        <div style="margin: 1rem 0;">
          <div style="
            font-size: 1.5rem;
            font-weight: 600;
            color: #4ade80;
            margin-bottom: 0.5rem;
          ">⏰ ${formatTime(remainingTime)} remaining</div>
          <div style="
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            margin: 0.5rem 0;
            overflow: hidden;
          ">
            <div style="
              height: 100%;
              background: linear-gradient(90deg, #4ade80, #22c55e);
              border-radius: 4px;
              width: ${progress}%;
              transition: width 1s ease;
            "></div>
          </div>
          <p style="
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 0.25rem;
          ">${Math.round(progress)}% complete</p>
        </div>
      ` : ''}
      
      <button id="jobquest-return-btn" style="
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        text-decoration: none;
        display: inline-block;
        transition: all 0.3s ease;
        font-weight: 500;
        cursor: pointer;
        font-size: 1rem;
      ">Return to Dashboard</button>
    </div>
    
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>
  `
  
  document.body.appendChild(overlay)
  
  // Add click handler for return button
  document.getElementById('jobquest-return-btn').addEventListener('click', () => {
    window.location.href = '/dashboard'
  })
  
  // Update timer every second
  if (remainingTime > 0) {
    const timerInterval = setInterval(() => {
      const newRemainingTime = getRemainingTime()
      const newProgress = getProgress()
      
      const timerElement = overlay.querySelector('div[style*="font-size: 1.5rem"]')
      const progressElement = overlay.querySelector('div[style*="background: linear-gradient"]')
      const progressText = overlay.querySelector('p[style*="font-size: 0.75rem"]')
      
      if (timerElement) {
        timerElement.textContent = `⏰ ${formatTime(newRemainingTime)} remaining`
      }
      
      if (progressElement) {
        progressElement.style.width = `${newProgress}%`
      }
      
      if (progressText) {
        progressText.textContent = `${Math.round(newProgress)}% complete`
      }
      
      // Auto-redirect when time is up
      if (newRemainingTime <= 0) {
        clearInterval(timerInterval)
        window.location.href = '/dashboard?session=completed'
      }
    }, 1000)
  }
}

// Remove blocking overlay
function removeBlockingOverlay() {
  const existingOverlay = document.getElementById('jobquest-focus-blocker-overlay')
  if (existingOverlay) {
    existingOverlay.remove()
  }
}

// Check current page on load
checkCurrentPage()

// Listen for navigation events
window.addEventListener('beforeunload', (e) => {
  if (isFocusActive && blockedSites.length) {
    const currentHostname = window.location.hostname
    const isBlocked = blockedSites.some(site => {
      const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
      const cleanHostname = currentHostname.replace(/^www\./, '')
      return cleanHostname.includes(cleanSite) || cleanSite.includes(cleanHostname)
    })
    
    if (isBlocked) {
      e.preventDefault()
      e.returnValue = 'This site is blocked during your focus session. Please complete your mission first.'
      return 'This site is blocked during your focus session. Please complete your mission first.'
    }
  }
})

// Listen for popstate (back/forward navigation)
window.addEventListener('popstate', () => {
  setTimeout(checkCurrentPage, 100)
})

// Listen for hash changes
window.addEventListener('hashchange', () => {
  setTimeout(checkCurrentPage, 100)
})

console.log('JobQuest Focus Blocker content script loaded')
