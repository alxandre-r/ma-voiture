import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/authUtils'

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { code } = await request.json()
    
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json(
        { error: 'Invite code is required and must be a non-empty string' },
        { status: 400 }
      )
    }
    
    // Find the family with this invite token
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('invite_token', code)
      .single()
    
    if (familyError || !family) {
      console.error('Family not found or error:', familyError)
      return NextResponse.json(
        { error: 'Invalid invite code or family not found' },
        { status: 404 }
      )
    }
    
    // Check if token is expired (if invite_token_expires exists)
    if (family.invite_token_expires && new Date(family.invite_token_expires) < new Date()) {
      return NextResponse.json(
        { error: 'Invite code has expired' },
        { status: 410 }
      )
    }
    
    // Check if token is already used
    if (family.invite_token_used) {
      return NextResponse.json(
        { error: 'Invite code has already been used' },
        { status: 409 }
      )
    }
    
    // Check if user is already a member of this family
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', family.id)
      .eq('user_id', user.id)
      .single()
    
    if (memberCheckError && !memberCheckError.message.includes('No rows found')) {
      console.error('Error checking existing membership:', memberCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing membership', details: memberCheckError.message },
        { status: 500 }
      )
    }
    
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this family' },
        { status: 409 }
      )
    }
    
    // Add user as a member
    const { error: joinError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: user.id,
        role: 'member'
      })
    
    if (joinError) {
      console.error('Error joining family:', joinError)
      return NextResponse.json(
        { error: 'Failed to join family', details: joinError.message },
        { status: 500 }
      )
    }
    
    // Mark token as used
    const { error: updateError } = await supabase
      .from('families')
      .update({
        invite_token_used: true
      })
      .eq('id', family.id)
    
    if (updateError) {
      console.error('Error marking token as used:', updateError)
      // This is not critical, so we don't rollback the membership
    }
    
    return NextResponse.json({
      success: true,
      family: {
        id: family.id,
        name: family.name,
        role: 'member'
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in join family:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}