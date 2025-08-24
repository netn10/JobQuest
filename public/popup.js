// Popup script for JobQuest Focus Blocker extension
let isActive = false
let startTime = null
let duration = null

// DOM elements
const statusEl = document.getElementById('status')
const statusTextEl = document.getElementById('status-text')
const timerEl = document.getElementById('timer')
const progressEl = document.getElementById('progress')
const progressFillEl = document.getElementById('progress-fill')
const toggleBtn = document.getElementById('toggle-btn')
const settingsBtn = document.getElementById('settings-btn')

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Check current status
  checkStatus()
  
  // Set up event listeners
  toggleBtn.addEventListener('click', toggleFocusSession)
  settingsBtn.addEventListener('click', openDashboard)
  
  // Update timer every second if active
  setInterval(updateTimer, 1000)
})

// Check current focus session status
function checkStatus() {
  chrome.storage.local.get(['focusActive', 'startTime', 'duration'], (result) => {
    isActive = result.focusActive || false
    startTime = result.startTime || null
    duration = result.duration || null
    
    updateUI()
  })
}

// Update the UI based on current status
function updateUI() {
  if (isActive) {
    statusEl.className = 'status active'
    statusTextEl.textContent = 'Focus session active'
    toggleBtn.textContent = 'Stop Focus Session'
    toggleBtn.className = 'button primary'
    
    if (duration) {
      timerEl.style.display = 'block'
      progressEl.style.display = 'block'
    }
  } else {
    statusEl.className = 'status inactive'
    statusTextEl.textContent = 'Focus session inactive'
    toggleBtn.textContent = 'Start Focus Session'
    toggleBtn.className = 'button primary'
    timerEl.style.display = 'none'
    progressEl.style.display = 'none'
  }
}

// Update timer display
function updateTimer() {
  if (!isActive || !startTime || !duration) return
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60)
  const remaining = Math.max(0, duration - elapsed)
  
  const hours = Math.floor(remaining / 60)
  const minutes = remaining % 60
  timerEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')} remaining`
  
  const progress = Math.max(0, Math.min(100, ((duration - remaining) / duration) * 100))
  progressFillEl.style.width = `${progress}%`
  
  // Auto-stop when time is up
  if (remaining <= 0) {
    stopFocusSession()
  }
}

// Toggle focus session
function toggleFocusSession() {
  if (isActive) {
    stopFocusSession()
  } else {
    startFocusSession()
  }
}

// Start focus session
function startFocusSession() {
  // For now, start with a default 25-minute session
  const defaultDuration = 25
  
  chrome.storage.local.set({
    focusActive: true,
    startTime: Date.now(),
    duration: defaultDuration
  }, () => {
    // Notify service worker
    chrome.runtime.sendMessage({
      type: 'FOCUS_START',
      blockedWebsites: ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com'],
      blockedApps: [],
      duration: defaultDuration
    })
    
    checkStatus()
  })
}

// Stop focus session
function stopFocusSession() {
  chrome.storage.local.set({
    focusActive: false,
    startTime: null,
    duration: null
  }, () => {
    // Notify service worker
    chrome.runtime.sendMessage({
      type: 'FOCUS_STOP'
    })
    
    checkStatus()
  })
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({
    url: 'http://localhost:3000/dashboard'
  })
}
