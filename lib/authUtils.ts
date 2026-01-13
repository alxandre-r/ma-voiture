import { createSupabaseServerClient } from './supabaseServer'

export async function getUser() {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Error getting user:', error)
    return null
  }
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    console.error('Error getting user profile:', profileError)
    return null
  }
  
  return {
    id: user.id,
    email: user.email,
    full_name: profile.full_name,
    ...profile
  }
}

export async function getUserId() {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user.id
}