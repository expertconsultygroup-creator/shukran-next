import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UAE_EMIRATES } from "@/lib/constants";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      UAE_EMIRATES.map((e) => ({ id: e.id, name_en: e.name_en, name_ar: e.name_ar, count: 0 }))
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .select("emirate")
    .eq("status", "approved")
    .not("emirate", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const countMap: Record<string, number> = {};
  data?.forEach((m: { emirate: string }) => {
    countMap[m.emirate] = (countMap[m.emirate] || 0) + 1;
  });

  return NextResponse.json(
    UAE_EMIRATES.map((e) => ({
      id: e.id,
      name_en: e.name_en,
      name_ar: e.name_ar,
      count: countMap[e.id] || 0,
    }))
  );
}
