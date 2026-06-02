import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("messages")
    .select("organization_name, organization_category, share_count")
    .eq("status", "approved")
    .eq("sender_type", "organization")
    .not("organization_name", "is", null);

  if (error) {
    // Columns may not exist yet (pre-migration) — degrade gracefully to an empty board.
    return NextResponse.json([]);
  }

  const orgMap: Record<
    string,
    { name: string; category: string; messages: number; shares: number }
  > = {};

  data?.forEach((m) => {
    const name = m.organization_name as string;
    if (!name) return;
    if (!orgMap[name]) {
      orgMap[name] = {
        name,
        category: m.organization_category || "",
        messages: 0,
        shares: 0,
      };
    }
    orgMap[name].messages += 1;
    orgMap[name].shares += m.share_count || 0;
  });

  const organizations = Object.values(orgMap)
    .sort((a, b) => b.messages + b.shares - (a.messages + a.shares))
    .slice(0, 50)
    .map((o, i) => {
      const score = o.messages + o.shares;
      return {
        rank: i + 1,
        ...o,
        score,
        badge: score >= 30 ? "💎" : score >= 20 ? "🥇" : score >= 10 ? "🥈" : "🥉",
      };
    });

  return NextResponse.json(organizations);
}
