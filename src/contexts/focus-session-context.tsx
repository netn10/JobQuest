'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface FocusSessionState {
  isActive: boolean
  missionId?: string
  missionTitle?: string
  missionStatus?: 'IN_PROGRESS' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  timeRemaining?: number
  missionDuration?: number
}

interface FocusSessionContextType {
  focusSession: FocusSessionState
  setFocusSession: (session: FocusSessionState) => void
  clearFocusSession: () => void
}

const FocusSessionContext = createContext<FocusSessionContextType | undefined>(undefined)

export function FocusSessionProvider({ children }: { children: ReactNode }) {
  const [focusSession, setFocusSessionState] = useState<FocusSessionState>({
    isActive: false
  })

  const setFocusSession = useCallback((session: FocusSessionState) => {
    setFocusSessionState(session)
  }, [])

  const clearFocusSession = useCallback(() => {
    setFocusSessionState({
      isActive: false
    })
  }, [])

  return (
    <FocusSessionContext.Provider value={{
      focusSession,
      setFocusSession,
      clearFocusSession
    }}>
      {children}
    </FocusSessionContext.Provider>
  )
}

export function useFocusSession() {
  const context = useContext(FocusSessionContext)
  if (context === undefined) {
    throw new Error('useFocusSession must be used within a FocusSessionProvider')
  }
  return context
}
