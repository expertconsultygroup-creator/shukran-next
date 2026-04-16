import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ poems: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  }
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const status = searchParams.get("status") || "approved";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("poems")
    .select("*", { count: "exact" })
    .eq("status", status)
    .range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,poet.ilike.%${search}%,text.ilike.%${search}%`);
  }

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    poems: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
