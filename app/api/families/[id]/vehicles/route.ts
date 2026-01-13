import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/authUtils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    const { id: familyId } = await params
    
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
    
    // Get all vehicles in the family
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('family_vehicles')
      .select('*')
      .eq('family_id', familyId)
      .order('vehicle_name', { ascending: true })
    
    if (vehiclesError) {
      console.error('Error fetching family vehicles:', vehiclesError)
      return NextResponse.json(
        { error: 'Failed to fetch family vehicles', details: vehiclesError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      vehicles: vehicles.map(vehicle => ({
        vehicle_id: vehicle.vehicle_id,
        user_id: vehicle.user_id,
        owner_name: vehicle.owner_name,
        vehicle_name: vehicle.vehicle_name,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        fuel_type: vehicle.fuel_type,
        manufacturer_consumption: vehicle.manufacturer_consumption,
        odometer: vehicle.odometer,
        plate: vehicle.plate,
        last_fill: vehicle.last_fill
      }))
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in get family vehicles:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}