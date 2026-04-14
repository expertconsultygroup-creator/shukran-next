import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ total: 847293, pending: 0, rejected: 0, goal: 1000000 });
  }

  const { data, error } = await supabase
    .from("counter_cache")
    .select("total_approved, total_pending, total_rejected")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      total: data.total_approved,
      pending: data.total_pending,
      rejected: data.total_rejected,
      goal: 1000000,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=5, stale-while-revalidate=30",
      },
    }
  );
}
