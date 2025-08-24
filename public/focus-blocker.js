// Focus Blocker Service Worker
let isFocusActive = false
let blockedSites = []
let blockedApps = []
let focusStartTime = null
let focusDuration = null

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data.type === 'FOCUS_START') {
    isFocusActive = true
    blockedSites = event.data.blockedWebsites || []
    blockedApps = event.data.blockedApps || []
    focusStartTime = Date.now()
    focusDuration = event.data.duration || null
    console.log('Focus session started, blocking:', blockedSites, 'Duration:', focusDuration)
    
    // Notify all clients (content scripts)
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FOCUS_START',
          blockedWebsites: blockedSites,
          blockedApps: blockedApps,
          startTime: focusStartTime,
          duration: focusDuration
        })
      })
    })
  } else if (event.data.type === 'FOCUS_STOP') {
    isFocusActive = false
    blockedSites = []
    blockedApps = []
    focusStartTime = null
    focusDuration = null
    console.log('Focus session stopped')
    
    // Notify all clients (content scripts)
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FOCUS_STOP'
        })
      })
    })
  }
})

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  if (!isFocusActive || !blockedSites.length) {
    return
  }

  const url = new URL(event.request.url)
  const hostname = url.hostname

  // Check if the current site is blocked
  const isBlocked = blockedSites.some(site => {
    const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
    const cleanHostname = hostname.replace(/^www\./, '')
    return cleanHostname.includes(cleanSite) || cleanSite.includes(cleanHostname)
  })

  if (isBlocked) {
    // Calculate remaining time
    let remainingTime = ''
    if (focusStartTime && focusDuration) {
      const elapsed = Math.floor((Date.now() - focusStartTime) / 1000 / 60)
      const remaining = Math.max(0, focusDuration - elapsed)
      const hours = Math.floor(remaining / 60)
      const minutes = remaining % 60
      remainingTime = `${hours}:${minutes.toString().padStart(2, '0')}`
    }

    // Block the request and return a blocking page
    event.respondWith(
      new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Site Blocked - Focus Session Active</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              max-width: 500px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 1rem;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            h1 {
              margin-bottom: 1rem;
              font-size: 2rem;
              font-weight: 700;
            }
            p {
              margin-bottom: 1rem;
              line-height: 1.6;
              opacity: 0.9;
            }
            .timer {
              font-size: 1.5rem;
              font-weight: 600;
              margin: 1rem 0;
              padding: 1rem;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 0.5rem;
            }
            .button {
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: 2px solid rgba(255, 255, 255, 0.3);
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              text-decoration: none;
              display: inline-block;
              transition: all 0.3s ease;
              font-weight: 500;
            }
            .button:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
            .progress-bar {
              width: 100%;
              height: 8px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 4px;
              margin: 1rem 0;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #4ade80, #22c55e);
              border-radius: 4px;
              transition: width 1s ease;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🚫</div>
            <h1>Site Blocked</h1>
            <p>This website is blocked during your focus session. Please complete your mission first to regain access.</p>
            ${remainingTime ? `
              <div class="timer">⏰ ${remainingTime} remaining</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, ((focusDuration - (Math.floor((Date.now() - focusStartTime) / 1000 / 60))) / focusDuration) * 100))}%"></div>
              </div>
            ` : ''}
            <a href="/dashboard" class="button">Return to Dashboard</a>
          </div>
          <script>
            // Auto-refresh timer every minute
            if (${focusStartTime && focusDuration ? 'true' : 'false'}) {
              setInterval(() => {
                const elapsed = Math.floor((Date.now() - ${focusStartTime}) / 1000 / 60);
                const remaining = Math.max(0, ${focusDuration} - elapsed);
                const hours = Math.floor(remaining / 60);
                const minutes = remaining % 60;
                const timerElement = document.querySelector('.timer');
                if (timerElement) {
                  timerElement.textContent = '⏰ ' + hours + ':' + minutes.toString().padStart(2, '0') + ' remaining';
                }
                
                // Update progress bar
                const progressFill = document.querySelector('.progress-fill');
                if (progressFill) {
                  const progress = Math.max(0, Math.min(100, (remaining / ${focusDuration}) * 100));
                  progressFill.style.width = progress + '%';
                }
                
                // Auto-redirect when time is up
                if (remaining <= 0) {
                  window.location.href = '/dashboard?session=completed';
                }
              }, 1000);
            }
          </script>
        </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    )
  }
})

// Intercept navigation requests
self.addEventListener('fetch', (event) => {
  if (!isFocusActive || !blockedSites.length) {
    return
  }

  const url = new URL(event.request.url)
  const hostname = url.hostname

  // Check if the navigation is to a blocked site
  const isBlocked = blockedSites.some(site => {
    const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
    const cleanHostname = hostname.replace(/^www\./, '')
    return cleanHostname.includes(cleanSite) || cleanSite.includes(cleanHostname)
  })

  if (isBlocked && event.request.mode === 'navigate') {
    // Redirect to blocking page
    event.respondWith(
      Response.redirect('/dashboard?blocked=true&type=website&site=' + encodeURIComponent(hostname))
    )
  }
})

// Handle installation
self.addEventListener('install', (event) => {
  console.log('Focus Blocker Service Worker installed')
  self.skipWaiting()
})

// Handle activation
self.addEventListener('activate', (event) => {
  console.log('Focus Blocker Service Worker activated')
  event.waitUntil(self.clients.claim())
})
