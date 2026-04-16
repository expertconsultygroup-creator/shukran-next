import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ videos: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  }
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  
  // Note: the original video API uses 'published' so we'll map 'approved' to 'published' optionally or just use 'published'
  let dbStatus = searchParams.get("status") || "published";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("videos")
    .select("*", { count: "exact" });

  // Allow "all" to skip status filter — admin sees everything
  if (dbStatus !== "all") {
    query = query.eq("status", dbStatus);
  }

  query = query.range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
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
    videos: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createAdminClient();
  const body = await request.json();

  const { title, description, category, youtube_id, youtubeId, duration, views } = body;
  const youtubeStr = youtube_id || youtubeId || "";

  const { data, error } = await adminClient
    .from("videos")
    .insert({
      title,
      description,
      category,
      youtube_id: youtubeStr,
      duration,
      views: Number(views) || 0,
      status: "published",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

