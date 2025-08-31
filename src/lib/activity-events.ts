// Utility for triggering activity-related events on the client side
export function triggerActivityLoggedEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('activity-logged'))
  }
}

// Daily challenge completion event
export interface DailyChallengeCompletedEvent {
  challengeTitle: string
  challengeDescription: string
  xpAwarded: number
}

export function triggerDailyChallengeCompletedEvent(event: DailyChallengeCompletedEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('daily-challenge-completed', {
      detail: event
    }))
  }
}

// Hook into fetch to automatically trigger the event when activities are logged via API
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch
  
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args)
    
    // Check if this was an API call that might have logged activities
    const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : undefined
    if (url && (
      url.includes('/api/missions') ||
      url.includes('/api/jobs') ||
      url.includes('/api/notebook') ||
      url.includes('/api/learning')
    )) {
      // If it was a successful POST/PATCH that could log activities, trigger the event
      const method = args[1]?.method || 'GET'
      if (response.ok && (method === 'POST' || method === 'PATCH')) {
        // Check for daily challenge completion in the response
        try {
          const clonedResponse = response.clone()
          const data = await clonedResponse.json()
          if (data.challengeCompleted) {
            triggerDailyChallengeCompletedEvent({
              challengeTitle: data.challengeCompleted.title,
              challengeDescription: data.challengeCompleted.description,
              xpAwarded: data.challengeCompleted.xpReward
            })
          }
        } catch (error) {
          // Ignore JSON parsing errors for non-JSON responses
        }
        
        // Small delay to ensure any server-side activity logging is complete
        setTimeout(() => triggerActivityLoggedEvent(), 50)
      }
    }
    
    return response
  }
}