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
    
    // Get family dashboard summary
    const { data: summary, error: summaryError } = await supabase
      .from('family_dashboard_summary')
      .select('*')
      .eq('family_id', familyId)
      .single()
    
    if (summaryError) {
      console.error('Error fetching family summary:', summaryError)
      return NextResponse.json(
        { error: 'Failed to fetch family summary', details: summaryError.message },
        { status: 500 }
      )
    }
    
    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('family_recent_activity')
      .select('*')
      .eq('family_id', familyId)
      .limit(10)
    
    if (activityError) {
      console.error('Error fetching recent activity:', activityError)
      // This is not critical, so we continue
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        total_vehicles: summary.total_vehicles || 0,
        total_fills: summary.total_fills || 0,
        total_liters: summary.total_liters || 0,
        total_spent: summary.total_spent || 0,
        last_fill_date: summary.last_fill_date || null,
        average_consumption: summary.total_fills > 0 
          ? parseFloat(((summary.total_liters / summary.total_fills) * 100).toFixed(2))
          : null
      },
      recent_activity: recentActivity ? recentActivity.map(activity => ({
        fill_id: activity.fill_id,
        vehicle_id: activity.vehicle_id,
        vehicle_name: activity.vehicle_name,
        user_id: activity.user_id,
        user_name: activity.user_name,
        fill_date: activity.fill_date,
        liters: activity.liters,
        amount: activity.amount,
        odometer: activity.odometer,
        activity_date: activity.activity_date
      })) : []
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in get family summary:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}