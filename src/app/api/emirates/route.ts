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

  const countMap: Record<string, number> = {};
  const PAGE_SIZE = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("messages")
      .select("emirate")
      .eq("status", "approved")
      .not("emirate", "is", null)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    data?.forEach((m: { emirate: string }) => {
      countMap[m.emirate] = (countMap[m.emirate] || 0) + 1;
    });

    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return NextResponse.json(
    UAE_EMIRATES.map((e) => ({
      id: e.id,
      name_en: e.name_en,
      name_ar: e.name_ar,
      count: countMap[e.id] || 0,
    }))
  );
}
