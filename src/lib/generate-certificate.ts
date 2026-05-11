const GOLD = "#CBA344";
const GOLD_LIGHT = "#E8D48B";
const DARK_BG = "#05101E";
const WHITE = "#F0F4FF";
const MUTED = "#8FA4B8";

const W = 1600;
const H = 1000;

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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function goldLine(ctx: CanvasRenderingContext2D, y: number, halfW: number) {
  const g = ctx.createLinearGradient(W / 2 - halfW, y, W / 2 + halfW, y);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.25, GOLD);
  g.addColorStop(0.75, GOLD);
  g.addColorStop(1, "transparent");
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - halfW, y);
  ctx.lineTo(W / 2 + halfW, y);
  ctx.stroke();
}

function cornerBracket(ctx: CanvasRenderingContext2D, x: number, y: number, sx: number, sy: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.lineTo(0, 0);
  ctx.lineTo(50, 0);
  ctx.stroke();
  // small diamond accent
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(16, 4);
  ctx.lineTo(22, 10);
  ctx.lineTo(16, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const texts = {
  en: {
    subtitle: "Thank You, Guardians of the Nation",
    title: "CERTIFICATE OF PARTICIPATION",
    body: "This is to certify that",
    line1: "has documented their message of gratitude to the guardians of the UAE",
    line2: "as part of the national campaign for documenting expressions of thanks",
    confirmLabel: "Confirmation No.",
    dateLabel: "Date",
    footer: "Shukran Hamaat Al-Watan Platform  ·  shukran.ae",
  },
  ar: {
    subtitle: "شكراً حماة الوطن",
    title: "شهادة مشاركة",
    body: "تشهد هذه الشهادة بأن",
    line1: "قد وثّق رسالة شكر لحماة الوطن",
    line2: "ضمن الحملة الوطنية لتوثيق رسائل الامتنان",
    confirmLabel: "رقم التوثيق",
    dateLabel: "التاريخ",
    footer: "منصة شكراً حماة الوطن  ·  shukran.ae",
  },
};

export async function downloadCertificate(params: {
  name: string;
  displayId: string;
  locale: "ar" | "en";
}) {
  const { name, displayId, locale } = params;
  const t = texts[locale];

  await Promise.all([
    loadFont("/fonts/Cairo-Regular.ttf", "CairoCert", "400"),
    loadFont("/fonts/Cairo-Bold.ttf", "CairoCert", "700"),
  ]);

  let logo: HTMLImageElement | null = null;
  try {
    logo = await loadImage("/media/logo.jpeg");
  } catch {
    // proceed without logo
  }

  const date = new Date().toLocaleDateString(
    locale === "ar" ? "ar-AE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ═══════════════════════════════════
  // BACKGROUND
  // ═══════════════════════════════════

  // Dark base
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, W, H);

  // Warm radial glow from center
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 700);
  glow.addColorStop(0, "rgba(203,163,68,0.06)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Subtle top-down gradient
  const topGlow = ctx.createLinearGradient(0, 0, 0, H);
  topGlow.addColorStop(0, "rgba(203,163,68,0.04)");
  topGlow.addColorStop(0.5, "transparent");
  topGlow.addColorStop(1, "rgba(203,163,68,0.02)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  // ═══════════════════════════════════
  // BORDERS
  // ═══════════════════════════════════

  // Outer border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  roundRect(ctx, 24, 24, W - 48, H - 48, 12);
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = "rgba(203,163,68,0.25)";
  ctx.lineWidth = 1;
  roundRect(ctx, 38, 38, W - 76, H - 76, 8);
  ctx.stroke();

  // Corner ornaments
  const ci = 32;
  cornerBracket(ctx, ci, ci, 1, 1);
  cornerBracket(ctx, W - ci, ci, -1, 1);
  cornerBracket(ctx, ci, H - ci, 1, -1);
  cornerBracket(ctx, W - ci, H - ci, -1, -1);

  // ═══════════════════════════════════
  // CONTENT - vertically centered
  // ═══════════════════════════════════
  // Total content height ~700px, center in H=1000
  // Content block: logo(130) + gap(20) + subtitle(24) + divider(30) + title(46) + stars(36) + body(28) + name(56) + underline(24) + confirmed(60) + gap(30) + infoRow(60) + divider(30) + footer(20)
  // = ~634px total. Start at (1000 - 634) / 2 ≈ 183

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let y: number;

  // ── Logo ──
  y = 120;
  if (logo) {
    const size = 130;
    const cx = W / 2;
    const cy = y + size / 2;

    // Outer gold ring glow
    ctx.save();
    ctx.shadowColor = "rgba(203,163,68,0.4)";
    ctx.shadowBlur = 16;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Clip and draw logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();

    y += size + 24;
  } else {
    y = 160;
  }

  // ── Subtitle ──
  ctx.fillStyle = MUTED;
  ctx.font = "400 20px CairoCert";
  ctx.fillText(t.subtitle, W / 2, y);
  y += 32;

  // ── Gold divider ──
  goldLine(ctx, y, 180);
  y += 32;

  // ── Title ──
  ctx.save();
  ctx.shadowColor = "rgba(203,163,68,0.35)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = GOLD;
  ctx.font = "700 42px CairoCert";
  ctx.fillText(t.title, W / 2, y);
  ctx.restore();
  y += 36;

  // ── Star decorations ──
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = "400 20px CairoCert";
  ctx.fillText("✦    ★    ✦    ★    ✦", W / 2, y);
  y += 44;

  // ── "This is to certify that" ──
  ctx.fillStyle = MUTED;
  ctx.font = "400 20px CairoCert";
  ctx.fillText(t.body, W / 2, y);
  y += 48;

  // ── NAME (the star of the show) ──
  ctx.save();
  ctx.shadowColor = "rgba(203,163,68,0.4)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = WHITE;
  ctx.font = "700 50px CairoCert";
  ctx.fillText(name, W / 2, y);
  ctx.restore();
  y += 18;

  // Gold underline under the name
  const nameMetrics = ctx.measureText(name);
  ctx.font = "700 50px CairoCert";
  const nlw = Math.max(nameMetrics.width + 60, 280);
  const ug = ctx.createLinearGradient(W / 2 - nlw / 2, y, W / 2 + nlw / 2, y);
  ug.addColorStop(0, "transparent");
  ug.addColorStop(0.15, GOLD);
  ug.addColorStop(0.85, GOLD);
  ug.addColorStop(1, "transparent");
  ctx.strokeStyle = ug;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nlw / 2, y);
  ctx.lineTo(W / 2 + nlw / 2, y);
  ctx.stroke();
  y += 42;

  // ── Confirmation lines ──
  ctx.fillStyle = MUTED;
  ctx.font = "400 17px CairoCert";
  ctx.fillText(t.line1, W / 2, y);
  y += 26;
  ctx.fillText(t.line2, W / 2, y);
  y += 46;

  // ── Info boxes ──
  const boxW = 240;
  const boxH = 70;
  const boxGap = 80;
  const leftX = W / 2 - boxW - boxGap / 2;
  const rightX = W / 2 + boxGap / 2;

  // Draw info box
  const drawInfoBox = (bx: number, label: string, value: string) => {
    // Box background
    ctx.fillStyle = "rgba(10,30,52,0.6)";
    ctx.strokeStyle = "rgba(203,163,68,0.3)";
    ctx.lineWidth = 1;
    roundRect(ctx, bx, y, boxW, boxH, 10);
    ctx.fill();
    roundRect(ctx, bx, y, boxW, boxH, 10);
    ctx.stroke();

    // Label
    ctx.fillStyle = MUTED;
    ctx.font = "400 13px CairoCert";
    ctx.fillText(label, bx + boxW / 2, y + 24);

    // Value
    ctx.fillStyle = GOLD;
    ctx.font = "700 20px CairoCert";
    ctx.fillText(value, bx + boxW / 2, y + 50);
  };

  drawInfoBox(leftX, t.confirmLabel, `#UAE-${displayId}`);
  drawInfoBox(rightX, t.dateLabel, date);
  y += boxH + 32;

  // ── Bottom divider ──
  goldLine(ctx, y, 300);
  y += 28;

  // ── Footer ──
  ctx.fillStyle = "rgba(143,164,184,0.5)";
  ctx.font = "400 14px CairoCert";
  ctx.fillText(t.footer, W / 2, y);

  // ═══════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════
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
