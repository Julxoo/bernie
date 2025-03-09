import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { status: string } }) {
  const { status } = params;

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("progress_status", status);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
