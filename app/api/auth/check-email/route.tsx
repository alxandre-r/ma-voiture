/**
 * @file app/api/auth/check-email/route.ts
 * @fileoverview Vérifie côté serveur si un email est déjà présent (table 'users_profile').
 *              Cette route utilise la clé service_role (côté serveur uniquement).
 *
 * POST body: { email: string }
 * Response: 200 { exists: boolean, confirmed?: boolean }
 *           400 / 500 on error
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

/**
 * POST /api/auth/check-email
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // On interroge la table users_profile pour vérifier si l'email existe
    const { data, error } = await supabaseAdmin
      .from("users_profile") // table users_profile
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Erreur check-email:", error);
      return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    // For email confirmation status, we need to check the auth.users table
    // Since we're using the service role, we can access auth.users directly
    const { data: authUser, error: authError } = await supabaseAdmin
      .from("auth.users")
      .select("email_confirmed_at")
      .eq("id", data.id)
      .maybeSingle();

    if (authError) {
      console.error("Erreur vérification confirmation email:", authError);
      // If we can't get confirmation status, assume not confirmed for safety
      return NextResponse.json({ exists: true, confirmed: false }, { status: 200 });
    }

    const confirmed = Boolean(authUser?.email_confirmed_at);
    return NextResponse.json({ exists: true, confirmed }, { status: 200 });
  } catch (err) {
    console.error("Erreur /check-email:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}