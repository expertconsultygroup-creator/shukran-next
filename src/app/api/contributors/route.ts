import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("messages")
    .select("name, nationality, country_name")
    .eq("status", "approved");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const contributorMap: Record<string, { name: string; nationality: string; country: string; messages: number }> = {};
  data?.forEach((m) => {
    if (!contributorMap[m.name]) {
      contributorMap[m.name] = { name: m.name, nationality: m.nationality, country: m.country_name, messages: 0 };
    }
    contributorMap[m.name].messages += 1;
  });

  const contributors = Object.values(contributorMap)
    .sort((a, b) => b.messages - a.messages)
    .slice(0, 50)
    .map((c, i) => ({
      rank: i + 1,
      ...c,
      badge: c.messages >= 30 ? "💎" : c.messages >= 20 ? "🥇" : c.messages >= 10 ? "🥈" : "🥉",
    }));

  return NextResponse.json(contributors);
}
