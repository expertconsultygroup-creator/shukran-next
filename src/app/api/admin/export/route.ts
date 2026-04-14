import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("messages")
    .select("display_id, name, text, nationality, country_name, category, created_at, ip_hash")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = ["Display ID", "Name", "Text", "Nationality", "Country", "Category", "Created At", "IP Hash"];
  const csv = [
    headers.join(","),
    ...(data || []).map((row) =>
      [
        row.display_id,
        `"${(row.name || "").replace(/"/g, '""')}"`,
        `"${(row.text || "").replace(/"/g, '""')}"`,
        row.nationality,
        row.country_name,
        row.category,
        row.created_at,
        row.ip_hash,
      ].join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guinness-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
