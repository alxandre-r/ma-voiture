// lib/data/vehicles/getFamilyVehicles.tsx
// SSR Fetch des véhicules des membres de la famille de l'utilisateur.

import { createSupabaseServerClient } from '../../supabase/supabaseServer'
import { cache } from 'react'

export const getFamilyVehicles = cache(async (userId: string, familyId?: string) => {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
        .from('vehicles_for_display') // On récupère les données depuis la vue
        .select('*')
        .eq('family_id', familyId)
        .neq('owner_id', userId) // Exclure les véhicules de l'utilisateur lui-même
        .order('created_at', { ascending: false })

    if (!familyId) return []
    if (error) {
        throw new Error(`Failed to fetch vehicles: ${error.message}`)
    }

    return data
})