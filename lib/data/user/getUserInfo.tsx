// lib/data/user/getUserInfo.tsx
// SSR Fetch des informations de l'utilisateur depuis la vue "users_info" pour les pages nécessitant des données utilisateur.

import { createSupabaseServerClient } from '../../supabase/supabaseServer'
import { cache } from 'react'

export const getUserInfo = cache(async (userId: string) => {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('users_info') // On récupère les données depuis la vue
        .select('*')
        .eq('id', userId)
        .single()   

    if (error) {
        throw new Error(`Failed to fetch user info: ${error.message}`)
    }

    return data
})