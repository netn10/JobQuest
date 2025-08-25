import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey } = body

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key format' },
        { status: 400 }
      )
    }

    // Test the API key with a simple request
    const openai = new OpenAI({ apiKey })
    
    try {
      await openai.models.list()
      
      return NextResponse.json({
        success: true,
        message: 'API key is valid'
      })
    } catch (error: any) {
      console.error('OpenAI API test failed:', error)
      
      if (error.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to validate API key' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error testing OpenAI API key:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
