import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/authUtils'

export async function POST(
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
        { error: 'Only family owners can generate invite codes' },
        { status: 403 }
      )
    }
    
    // Generate a new invite token
    const newToken = crypto.randomUUID()
    
    // Update the family with new invite token
    const { data: updatedFamily, error: updateError } = await supabase
      .from('families')
      .update({
        invite_token: newToken,
        invite_token_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        invite_token_used: false
      })
      .eq('id', familyId)
      .select('*')
      .single()
    
    if (updateError) {
      console.error('Error generating new invite token:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate new invite token', details: updateError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      invite_token: updatedFamily.invite_token,
      invite_token_expires: updatedFamily.invite_token_expires,
      invite_link: `${process.env.NEXT_PUBLIC_APP_URL}/families/join?code=${updatedFamily.invite_token}`
    }, { status: 200 })
    
  } catch (error) {
    console.error('Unexpected error in generate invite:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}