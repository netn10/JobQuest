import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const body = await request.json()

    const { company, role, description, status, notes, nextAction, salary, location, jobUrl } = body

    if (!company || !role) {
      return NextResponse.json({ error: 'Company and role are required' }, { status: 400 })
    }

    const application = await prisma.jobApplication.update({
      where: { 
        id: id,
        userId // Ensure user can only update their own applications
      },
      data: {
        company,
        role,
        description,
        status,
        notes,
        nextAction,
        salary,
        location,
        jobUrl
      }
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')

    await prisma.jobApplication.delete({
      where: { 
        id: id,
        userId // Ensure user can only delete their own applications
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
