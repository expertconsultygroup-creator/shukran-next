import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createHash } from "crypto";

const messageSchema = z.object({
  name: z.string().min(1).max(100),
  text: z.string().min(10).max(500),
  nationality: z.string().min(1),
  country_code: z.string().length(2).default("AE"),
  country_name: z.string().min(1).default("الإمارات"),
  category: z.enum(["مواطن", "مقيم", "طالب", "جهة"]),
  voice_url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ messages: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  }
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const status = searchParams.get("status") || "approved";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("messages")
    .select("*", { count: "exact" })
    .eq("status", status)
    .range(from, to);

  if (category && category !== "الكل") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,text.ilike.%${search}%,display_id.ilike.%${search}%`);
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
    messages: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  const sanitizedText = parsed.data.text.replace(/<[^>]*>/g, "");

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      name: parsed.data.name,
      text: sanitizedText,
      nationality: parsed.data.nationality,
      country_code: parsed.data.country_code,
      country_name: parsed.data.country_name,
      category: parsed.data.category,
      voice_url: parsed.data.voice_url || null,
      ip_hash: ipHash,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data, success: true }, { status: 201 });
}
