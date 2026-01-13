import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/authUtils'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    const familyId = params.id
    const targetUserId = params.userId
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!familyId || typeof familyId !== 'string' || !targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid family ID or user ID' },
        { status: 400 }
      )
    }
    
    const { role } = await request.json()
    
    if (!role || (role !== 'owner' && role !== 'member')) {
      return NextResponse.json(
        { error: 'Role must be either "owner" or "member"' },
        { status: 400 }
      )
    }
    
    // Check if current user is an owner of this family
    const { data: currentUserMembership, error: membershipError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()
    
    if (membershipError || !currentUserMembership) {
      console.error('User is not an owner of this family or error:', membershipError)
      return NextResponse.json(
        { error: 'Only family owners can modify member roles' },
        { status: 403 }
      )
    }
    
    // Check if target user is a member of this family
    const { data: targetMembership, error: targetError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', targetUserId)
      .single()
    
    if (targetError || !targetMembership) {
      console.error('Target user is not a member of this family or error:', targetError)
      return NextResponse.json(
        { error: 'Target user is not a member of this family' },
        { status: 404 }
      )
    }
    
    // Prevent demoting the only owner
    if (role === 'member' && targetMembership.role === 'owner') {
      const { count, error: countError } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .eq('role', 'owner')
      
      if (countError || count <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the only owner of the family' },
          { status: 400 }
        )
      }
    }
    
    // Update the member's role
    const { data: updatedMember, error: updateError } = await supabase
      .from('family_members')
      .update({
        role: role
      })
      .eq('family_id', familyId)
      .eq('user_id', targetUserId)
      .select('*, users_profile:users_profile(full_name, email)')
      .single()
    
    if (updateError) {
      console.error('Error updating member role:', updateError)
      return NextResponse.json(
        { error: 'Failed to update member role', details: updateError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      member: {
        user_id: updatedMember.user_id,
        full_name: updatedMember.users_profile?.full_name || 'Unknown',
        email: updatedMember.users_profile?.email || null,
        role: updatedMember.role,
        joined_at: updatedMember.joined_at
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in update member role:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    const familyId = params.id
    const targetUserId = params.userId
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!familyId || typeof familyId !== 'string' || !targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid family ID or user ID' },
        { status: 400 }
      )
    }
    
    // Check if current user is an owner of this family
    const { data: currentUserMembership, error: membershipError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()
    
    if (membershipError || !currentUserMembership) {
      console.error('User is not an owner of this family or error:', membershipError)
      return NextResponse.json(
        { error: 'Only family owners can remove members' },
        { status: 403 }
      )
    }
    
    // Check if target user is a member of this family
    const { data: targetMembership, error: targetError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', targetUserId)
      .single()
    
    if (targetError || !targetMembership) {
      console.error('Target user is not a member of this family or error:', targetError)
      return NextResponse.json(
        { error: 'Target user is not a member of this family' },
        { status: 404 }
      )
    }
    
    // Prevent removing the only owner
    if (targetMembership.role === 'owner') {
      const { count, error: countError } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .eq('role', 'owner')
      
      if (countError || count <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the only owner of the family' },
          { status: 400 }
        )
      }
    }
    
    // Prevent user from removing themselves
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the family. Use leave endpoint instead.' },
        { status: 400 }
      )
    }
    
    // Remove the member
    const { error: deleteError } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', targetUserId)
    
    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove member', details: deleteError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Member removed from family successfully'
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in remove member:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}