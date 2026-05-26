import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Normalize: try with +971 prefix, without prefix, and raw
  const digits = phone.replace(/[\s\-()]/g, "");
  const variations = [
    digits,
    digits.startsWith("+971") ? digits : `+971${digits.replace(/^0/, "")}`,
    digits.replace(/^\+971/, ""),
    digits.replace(/^\+971/, "0"),
  ];

  // Search for any matching phone
  const { data, error } = await supabase
    .from("messages")
    .select("id, name, text, phone, emirate, category, display_id, created_at, voice_url, status")
    .or(variations.map((v) => `phone.eq.${v}`).join(","))
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "No message found for this phone number" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: data });
}
