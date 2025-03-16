// src/app/api/casino-reports/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from("casino_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// src/app/api/casino-reports/route.ts
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const data = await request.json();

  // Vérifier et fournir des valeurs par défaut
  if (!data.template_id) {
    data.template_id = 1;
  }
  if (!data.template_name) {
    data.template_name = "Rapport Performances Mensuelles";
  }

  try {
    const { data: result, error } = await supabase
      .from("casino_reports")
      .insert([data])
      .select();

    if (error) throw error;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
