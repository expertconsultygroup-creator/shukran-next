export async function uploadAudio(blob: Blob): Promise<string> {
  if (!blob || blob.size === 0) {
    throw new Error("No audio recorded");
  }

  // Determine extension and clean MIME type (strip codec suffix)
  const rawType = (blob.type || "").toLowerCase();
  let ext = "webm";
  let cleanType = "audio/webm";
  if (rawType.includes("mp4") || rawType.includes("m4a")) {
    ext = "mp4";
    cleanType = "audio/mp4";
  } else if (rawType.includes("ogg")) {
    ext = "ogg";
    cleanType = "audio/ogg";
  }

  // Create a proper File with a clean MIME type (no codec suffix)
  const file = new File([blob], `recording.${ext}`, { type: cleanType });

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}
