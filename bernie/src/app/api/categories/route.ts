import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

async function getNextIdentifier(supabase: any) {
  const { data: categories } = await supabase
    .from('video_categories')
    .select('identifier')
    .order('identifier', { ascending: true });

  if (!categories || categories.length === 0) {
    return ALPHABET[0]; // Retourne 'A' si aucune catégorie n'existe
  }

  // Trouve le dernier identifiant utilisé
  const lastIdentifier = categories[categories.length - 1].identifier;
  const lastIndex = ALPHABET.indexOf(lastIdentifier);

  if (lastIndex === -1 || lastIndex === ALPHABET.length - 1) {
    throw new Error("Plus d'identifiants disponibles");
  }

  return ALPHABET[lastIndex + 1];
}

// GET /api/categories
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('video_categories')
      .select('*')
      .order('identifier');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    const identifier = await getNextIdentifier(supabase);

    const { data, error } = await supabase
      .from('video_categories')
      .insert([{ 
        identifier,
        title,
        user_id: session.user.id // Ajout de l'ID de l'utilisateur
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
} 