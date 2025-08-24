import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { focusSettings: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const focusSettings = user.focusSettings ? JSON.parse(user.focusSettings as string) : {
      blockedWebsites: ['facebook.com', 'twitter.com', 'youtube.com', 'reddit.com'],
      blockedApps: ['Slack', 'Discord', 'Steam'],
      defaultMissionDuration: 25,
      pomodoroBreakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: false,
      strictMode: true
    }

    return NextResponse.json({
      success: true,
      focusSettings
    })
  } catch (error) {
    console.error('Error fetching focus settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch focus settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, focusSettings } = body

    if (!userId || !focusSettings) {
      return NextResponse.json(
        { success: false, error: 'User ID and focus settings required' },
        { status: 400 }
      )
    }

    // Get current settings to merge
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { focusSettings: true }
    })

    const currentSettings = currentUser?.focusSettings ? JSON.parse(currentUser.focusSettings as string) : {}
    const mergedSettings = { ...currentSettings, ...focusSettings }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        focusSettings: JSON.stringify(mergedSettings)
      }
    })

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error updating focus settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update focus settings' },
      { status: 500 }
    )
  }
}