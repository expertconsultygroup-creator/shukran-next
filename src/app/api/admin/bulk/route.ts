import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { ids, status, entity = "messages" } = body;

  const validStatuses = ["approved", "rejected", "published", "pending"];
  if (!Array.isArray(ids) || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const validEntities = ["messages", "poems", "videos"];
  if (!validEntities.includes(entity)) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const updateData: any = { status };
  if (entity === "messages") {
    updateData.moderator_id = user.id;
    updateData.moderated_at = new Date().toISOString();
    updateData.verified = status === "approved";
  }

  const { data, error } = await adminClient
    .from(entity)
    .update(updateData)
    .in("id", ids)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: data?.length || 0 });
}
