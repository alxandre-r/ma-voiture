/**
 * @file app/api/vehicles/get/route.tsx
 * @fileoverview API route to fetch vehicles for authenticated user's family.
 * 
 * This endpoint returns all vehicles of the current user's family,
 * ordered by creation date (newest first).
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * GET /api/vehicles/get/family_vehicles
 * 
 * Fetch all vehicles for authenticated user's family.
 * 
 * @returns {Promise<NextResponse>} JSON response with vehicles array or error
 */
export async function GET() {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get user's family_id from family_members
    const { data: familyMember, error: familyMemberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

    if (familyMemberError || !familyMember) {
        return NextResponse.json({ error: 'Famille non trouvée' }, { status: 404 });
    }

    // Fetch all vehicles for this family
    const { data: vehicles, error: vehiclesError } = await supabase
        .from('family_vehicles')
        .select('*')
        .eq('family_id', familyMember.family_id);

    if (vehiclesError) {
        return NextResponse.json({ error: vehiclesError.message }, { status: 500 });
    }

    return NextResponse.json({ vehicles });
}