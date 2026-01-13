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
    const familyId = (await params).id
    
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
      console.error('User not a member of this family or error:', membershipError)
      return NextResponse.json(
        { error: 'User is not a member of this family or family not found' },
        { status: 403 }
      )
    }
    
    // Get family details
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single()
    
    if (familyError || !family) {
      console.error('Family not found or error:', familyError)
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      )
    }
    
    // Get all members with their details
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select('*, users_profile:users_profile(full_name, email)')
      .eq('family_id', familyId)
    
    if (membersError) {
      console.error('Error fetching family members:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch family members', details: membersError.message },
        { status: 500 }
      )
    }
    
    // Get vehicles count for this family
    const { count: vehiclesCount, error: vehiclesError } = await supabase
      .from('family_vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
    
    // Get fills count for this family
    const { count: fillsCount, error: fillsError } = await supabase
      .from('family_fills')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId)
    
    return NextResponse.json({
      success: true,
      family: {
        id: family.id,
        name: family.name,
        owner: family.owner,
        created_at: family.created_at,
        invite_token: membership.role === 'owner' ? family.invite_token : null,
        invite_token_expires: membership.role === 'owner' ? family.invite_token_expires : null,
        invite_token_used: membership.role === 'owner' ? family.invite_token_used : null
      },
      current_user_role: membership.role,
      members: members.map(member => ({
        user_id: member.user_id,
        full_name: member.users_profile?.full_name || 'Unknown',
        email: member.users_profile?.email || null,
        role: member.role,
        joined_at: member.joined_at
      })),
      statistics: {
        vehicles_count: vehiclesError ? 0 : vehiclesCount,
        fills_count: fillsError ? 0 : fillsCount
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in get family details:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    const familyId = (await params).id
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!familyId || typeof familyId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid family ID' },
        { status: 400 }
      )
    }
    
    const { name } = await request.json()
    
    // Check if user is an owner of this family
    const { data: membership, error: membershipError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()
    
    if (membershipError || !membership) {
      console.error('User is not an owner of this family or error:', membershipError)
      return NextResponse.json(
        { error: 'Only family owners can modify family details' },
        { status: 403 }
      )
    }
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Family name is required and must be a non-empty string' },
        { status: 400 }
      )
    }
    
    // Update family name
    const { data: updatedFamily, error: updateError } = await supabase
      .from('families')
      .update({
        name: name.trim()
      })
      .eq('id', familyId)
      .select('*')
      .single()
    
    if (updateError) {
      console.error('Error updating family:', updateError)
      return NextResponse.json(
        { error: 'Failed to update family', details: updateError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      family: {
        id: updatedFamily.id,
        name: updatedFamily.name,
        owner: updatedFamily.owner,
        created_at: updatedFamily.created_at
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in update family:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    const familyId = (await params).id
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!familyId || typeof familyId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid family ID' },
        { status: 400 }
      )
    }
    
    // Check if user is an owner of this family
    const { data: membership, error: membershipError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()
    
    if (membershipError || !membership) {
      console.error('User is not an owner of this family or error:', membershipError)
      return NextResponse.json(
        { error: 'Only family owners can delete families' },
        { status: 403 }
      )
    }
    
    // Delete the family (this will cascade to family_members due to ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from('families')
      .delete()
      .eq('id', familyId)
    
    if (deleteError) {
      console.error('Error deleting family:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete family', details: deleteError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Family deleted successfully'
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in delete family:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}