import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json([]);

  const { data: countries, error: countriesError } = await supabase
    .from("countries")
    .select("*");

  if (countriesError) {
    return NextResponse.json({ error: countriesError.message }, { status: 500 });
  }

  const { data: counts, error: countsError } = await supabase
    .from("messages")
    .select("country_code")
    .eq("status", "approved");

  if (countsError) {
    return NextResponse.json({ error: countsError.message }, { status: 500 });
  }

  const countMap: Record<string, number> = {};
  counts?.forEach((m) => {
    countMap[m.country_code] = (countMap[m.country_code] || 0) + 1;
  });

  const result = countries?.map((c) => ({
    ...c,
    count: countMap[c.code] || 0,
  }));

  return NextResponse.json(result);
}
