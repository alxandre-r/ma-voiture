import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/authUtils'

export async function POST(
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
        { status: 404 }
      )
    }
    
    // Prevent the only owner from leaving
    if (membership.role === 'owner') {
      const { count, error: countError } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .eq('role', 'owner')
      
      if (countError || (count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'Cannot leave the family as the only owner. Promote another member first.' },
          { status: 400 }
        )
      }
    }
    
    // Remove the user from the family
    const { error: deleteError } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', user.id)
    
    if (deleteError) {
      console.error('Error leaving family:', deleteError)
      return NextResponse.json(
        { error: 'Failed to leave family', details: deleteError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully left the family'
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in leave family:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}