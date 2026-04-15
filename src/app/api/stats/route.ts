import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({
      totalMessages: 847293,
      todayMessages: 0,
      pendingMessages: 0,
      rejectedMessages: 0,
      totalCountries: 0,
      totalVideos: 0,
      totalPoems: 0,
      categoryBreakdown: [],
      countryBreakdown: [],
      dailyStats: [],
    });
  }

  // Run all queries in parallel
  const [counterRes, countriesRes, videosRes, poemsRes, categoryRes, countryBreakRes, dailyRes] = await Promise.all([
    supabase.from("counter_cache").select("total_approved, total_pending, total_rejected").eq("id", 1).single(),
    supabase.from("messages").select("country_code").eq("status", "approved"),
    supabase.from("videos").select("id").eq("status", "published"),
    supabase.from("poems").select("id").eq("status", "approved"),
    supabase.from("messages").select("category").eq("status", "approved"),
    supabase.from("messages").select("country_name, nationality").eq("status", "approved"),
    supabase.from("daily_stats").select("*").order("date", { ascending: false }).limit(7),
  ]);

  // Category breakdown
  const catMap: Record<string, number> = {};
  categoryRes.data?.forEach((m) => {
    catMap[m.category] = (catMap[m.category] || 0) + 1;
  });
  const totalCat = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
  const categoryBreakdown = Object.entries(catMap).map(([name, count]) => ({
    name,
    value: Math.round((count / totalCat) * 100 * 10) / 10,
    count,
  }));

  // Country breakdown (unique countries)
  const uniqueCountries = new Set(countriesRes.data?.map((m) => m.country_code));

  // Nationality breakdown for pie chart
  const natMap: Record<string, number> = {};
  countryBreakRes.data?.forEach((m) => {
    const key = m.nationality || m.country_name || "أخرى";
    natMap[key] = (natMap[key] || 0) + 1;
  });
  const totalNat = Object.values(natMap).reduce((a, b) => a + b, 0) || 1;
  const countryBreakdown = Object.entries(natMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / totalNat) * 100 * 10) / 10,
      count,
    }));

  return NextResponse.json({
    totalMessages: counterRes.data?.total_approved || 0,
    pendingMessages: counterRes.data?.total_pending || 0,
    rejectedMessages: counterRes.data?.total_rejected || 0,
    totalCountries: uniqueCountries.size,
    totalVideos: videosRes.data?.length || 0,
    totalPoems: poemsRes.data?.length || 0,
    categoryBreakdown,
    countryBreakdown,
    dailyStats: dailyRes.data || [],
  });
}
