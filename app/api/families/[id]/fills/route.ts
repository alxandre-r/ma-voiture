import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/authUtils'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    const familyId = params.id
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!familyId || typeof familyId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid family ID' },
        { status: 400 }
      )
    }
    
    // Check if user is a member of this family
    const { data: membership, error: membershipError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .single()
    
    if (membershipError || !membership) {
      console.error('User is not a member of this family or error:', membershipError)
      return NextResponse.json(
        { error: 'User is not a member of this family' },
        { status: 403 }
      )
    }
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')
    const userId = searchParams.get('user_id')
    const limit = searchParams.get('limit') || '100'
    const offset = searchParams.get('offset') || '0'
    
    // Build the query
    let query = supabase
      .from('family_fills')
      .select('*')
      .eq('family_id', familyId)
      .order('date', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
    
    // Apply filters
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: fills, error: fillsError } = await query
    
    if (fillsError) {
      console.error('Error fetching family fills:', fillsError)
      return NextResponse.json(
        { error: 'Failed to fetch family fills', details: fillsError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      fills: fills.map(fill => ({
        fill_id: fill.fill_id,
        vehicle_id: fill.vehicle_id,
        vehicle_name: fill.vehicle_name,
        user_id: fill.user_id,
        owner_name: fill.owner_name,
        date: fill.date,
        odometer: fill.odometer,
        liters: fill.liters,
        amount: fill.amount,
        price_per_liter: fill.price_per_liter,
        is_full: fill.is_full,
        notes: fill.notes,
        created_at: fill.created_at
      }))
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in get family fills:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}