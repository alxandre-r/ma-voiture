import { NextResponse } from "next/server";
import { createSupabaseServerClient }  from "@/lib/supabaseServer";


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const supabase = await createSupabaseServerClient();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Vérifier si un utilisateur avec cet email existe déjà
    const { data: existingUsers, error: checkError } = await supabase
      .from("users") // vue
      .select("id")
      .eq("email", email);

    if (checkError) {
      console.error("Erreur vérification utilisateur:", checkError.message);
      return NextResponse.json(
        { error: "Erreur lors de la vérification" },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    // Créer un nouvel utilisateur
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, 
    });

    if (error) {
      console.error("Erreur création utilisateur:", error.message);
      return NextResponse.json(
        { error: "Erreur lors de l'inscription" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Inscription réussie. Vous pouvez vous connecter." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur API:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}