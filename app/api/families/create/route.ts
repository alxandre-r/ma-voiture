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
    
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Family name is required and must be a non-empty string' },
        { status: 400 }
      )
    }
    
    // Create the family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        name: name.trim(),
        owner: user.id,
        invite_token: crypto.randomUUID()
      })
      .select('*')
      .single()
    
    if (familyError) {
      console.error('Error creating family:', familyError)
      return NextResponse.json(
        { error: 'Failed to create family', details: familyError.message },
        { status: 500 }
      )
    }
    
    // Add the owner as a member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: user.id,
        role: 'owner'
      })
    
    if (memberError) {
      console.error('Error adding owner as member:', memberError)
      // Rollback: delete the family if we couldn't add the owner as member
      await supabase.from('families').delete().eq('id', family.id)
      return NextResponse.json(
        { error: 'Failed to add owner as family member', details: memberError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      family: {
        id: family.id,
        name: family.name,
        owner: family.owner,
        invite_token: family.invite_token,
        created_at: family.created_at
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Unexpected error in create family:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}