import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["audio/webm", "audio/mp3", "audio/wav", "audio/mpeg", "audio/ogg"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const fileId = crypto.randomUUID();
  const ext = file.name.split(".").pop() || "webm";
  const filePath = `${fileId}/recording.${ext}`;

  const { data, error } = await supabase.storage
    .from("voice-recordings")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("voice-recordings")
    .getPublicUrl(filePath);

  return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
}
