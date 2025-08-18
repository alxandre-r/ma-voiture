/**
 * @file app/api/auth/sign-up/route.ts
 * @fileoverview Create a new user via Supabase Admin API and mark the email as confirmed.
 *              This allows immediate sign-in without sending a confirmation email.
 *
 * NOTE: This route uses SUPABASE_SERVICE_ROLE_KEY and must be server-only.
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create an admin client using the service_role key (server only)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    // -- Optional: check your view 'users' to avoid duplicates (you already had that) --
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from("users") // ta vue qui expose email / confirmed
      .select("id, email_confirmed_at")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Erreur vérification utilisateur:", checkError);
      return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
    }

    if (existingUsers) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    // Create the user and mark as confirmed so they can sign in immediately.
    // email_confirmed_at will be set by Supabase when email_confirm: true
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // <- marque confirmé, pas d'email envoyé
    });

    if (error) {
      console.error("Erreur création utilisateur:", error);
      return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
    }

    return NextResponse.json({ message: "Inscription réussie. Vous pouvez vous connecter." }, { status: 201 });
  } catch (err) {
    console.error("Erreur API:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}