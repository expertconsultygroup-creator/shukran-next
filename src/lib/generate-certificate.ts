const GOLD = "#CBA344";
const GOLD_LIGHT = "#E8D48B";

const TEMPLATE_SRC = "/certificate/template.jpg";

function loadFont(url: string, family: string, weight: string): Promise<void> {
  const font = new FontFace(family, `url(${url})`, { weight });
  return font.load().then((f) => {
    document.fonts.add(f);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function downloadCertificate(params: {
  name: string;
  displayId: string;
  locale: "ar" | "en";
}) {
  const { name, displayId } = params;

  await Promise.all([
    loadFont("/fonts/Cairo-Regular.ttf", "CairoCert", "400"),
    loadFont("/fonts/Cairo-Bold.ttf", "CairoCert", "700"),
  ]);

  const template = await loadImage(TEMPLATE_SRC);

  const W = template.naturalWidth;
  const H = template.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background: the fixed template artwork (logos, calligraphy, body text, signatures)
  ctx.drawImage(template, 0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // ── Recipient name inside the ornate cartouche ──
  ctx.save();
  ctx.shadowColor = "rgba(203,163,68,0.45)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = GOLD_LIGHT;
  // template is 1280×714; cartouche center is around (640, 375)
  ctx.font = `700 ${Math.round(H * 0.055)}px CairoCert`;
  ctx.fillText(name, W * 0.5, H * 0.525);
  ctx.restore();

  // ── Certificate number under the "رقم الشهادة" label (bottom-left of template) ──
  ctx.fillStyle = GOLD;
  ctx.font = `700 ${Math.round(H * 0.032)}px CairoCert`;
  ctx.fillText(`#UAE-${displayId}`, W * 0.205, H * 0.93);

  // ── Download ──
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shukran-certificate-${displayId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}
