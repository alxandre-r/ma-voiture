/**
 * @file app/api/family/members/[userId]/route.ts
 * @description API endpoint to remove a member from family.
 *
 * This endpoint allows the family owner to remove a member from the family.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function DELETE(
    _request: Request,
    // @ts-expect-error: Next.js injecte ce paramètre, typage non supporté
    context
) {
    const userId = context.params.userId as string;

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
        { error: 'Non autorisé - utilisateur non connecté' },
        { status: 401 }
        );
    }

    const { data: familyMember, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, role')
        .eq('user_id', user.id)
        .single();

    if (memberError || !familyMember || familyMember.role !== 'owner') {
        return NextResponse.json(
        { error: 'Seul le propriétaire de la famille peut supprimer des membres' },
        { status: 403 }
        );
    }

    if (userId === user.id) {
        return NextResponse.json(
        { error: 'Vous ne pouvez pas vous supprimer vous-même' },
        { status: 400 }
        );
    }

    const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyMember.family_id)
        .eq('user_id', userId);

    if (error) {
        return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
}