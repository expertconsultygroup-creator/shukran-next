import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_BASE_TYPES = [
  "audio/webm",
  "audio/mp3",
  "audio/wav",
  "audio/mpeg",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
];

// Map file extension to MIME type as fallback
const EXT_TO_MIME: Record<string, string> = {
  webm: "audio/webm",
  mp3: "audio/mp3",
  wav: "audio/wav",
  ogg: "audio/ogg",
  mp4: "audio/mp4",
  m4a: "audio/mp4",
  aac: "audio/aac",
};

function resolveContentType(fileType: string, fileName: string): string | null {
  // Strip codec suffix: "audio/webm;codecs=opus" → "audio/webm"
  const base = fileType.split(";")[0].trim().toLowerCase();
  if (base && ALLOWED_BASE_TYPES.includes(base)) return base;

  // Fallback: derive from file extension
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_MIME[ext] || null;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const contentType = resolveContentType(file.type, file.name);
  if (!contentType) {
    return NextResponse.json(
      { error: `Invalid file type: ${file.type || "(empty)"}` },
      { status: 400 }
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const fileId = crypto.randomUUID();
  const ext = file.name.split(".").pop() || "webm";
  const filePath = `${fileId}/recording.${ext}`;

  // Read file into ArrayBuffer to avoid MIME type header conflicts
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("voice-recordings")
    .upload(filePath, buffer, {
      contentType,
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
