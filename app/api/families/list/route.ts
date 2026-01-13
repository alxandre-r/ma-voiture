import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/authUtils'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get all families where user is a member
    const { data: families, error } = await supabase
      .from('family_members')
      .select(`
        family_id,
        role,
        joined_at,
        families:families(*)
      `)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error fetching user families:', error)
      return NextResponse.json(
        { error: 'Failed to fetch families', details: error.message },
        { status: 500 }
      )
    }
    
    // Get members count for each family
    const familiesWithMembers = await Promise.all(
      families.map(async (family) => {
        const { count, error: countError } = await supabase
          .from('family_members')
          .select('*', { count: 'exact', head: true })
          .eq('family_id', family.family_id)
        
        return {
          id: family.family_id,
          name: family.families?.[0]?.name,
          role: family.role,
          member_count: countError ? 0 : count,
          joined_at: family.joined_at,
          created_at: family.families?.[0]?.created_at,
          owner: family.families?.[0]?.owner
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      families: familiesWithMembers
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in list families:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}