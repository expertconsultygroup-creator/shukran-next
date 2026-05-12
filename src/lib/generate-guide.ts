import jsPDF from "jspdf";

/* ── Design tokens ── */
const GOLD = "#CBA344";
const GOLD_LIGHT = "#E8D48B";
const DARK = "#05101E";
const SURFACE = "#0A1E34";
const WHITE = "#F0F4FF";
const MUTED = "#8FA4B8";
const GREEN = "#3F8E50";

/* A4 landscape in px at 2x for sharp rendering */
const PW = 1684; // page width
const PH = 1190; // page height

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

/* ── Canvas helpers ── */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function goldLine(ctx: CanvasRenderingContext2D, y: number, halfW: number, cx: number = PW / 2) {
  const g = ctx.createLinearGradient(cx - halfW, y, cx + halfW, y);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.2, GOLD);
  g.addColorStop(0.8, GOLD);
  g.addColorStop(1, "transparent");
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, y);
  ctx.lineTo(cx + halfW, y);
  ctx.stroke();
}

function pageBg(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, PW, PH);
  const glow = ctx.createRadialGradient(PW / 2, PH / 2, 0, PW / 2, PH / 2, 700);
  glow.addColorStop(0, "rgba(203,163,68,0.05)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, PW, PH);
}

function pageBorder(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  roundRect(ctx, 24, 24, PW - 48, PH - 48, 12);
  ctx.stroke();
  ctx.strokeStyle = "rgba(203,163,68,0.2)";
  ctx.lineWidth = 1;
  roundRect(ctx, 38, 38, PW - 76, PH - 76, 8);
  ctx.stroke();
}

function pageFooter(ctx: CanvasRenderingContext2D, pageNum: number, total: number) {
  ctx.fillStyle = "rgba(143,164,184,0.4)";
  ctx.font = "400 16px GuideFont";
  ctx.textAlign = "center";
  ctx.fillText(`www.shukranwatan.ae  ·  ${pageNum} / ${total}`, PW / 2, PH - 50);
}

function drawStepCircle(ctx: CanvasRenderingContext2D, x: number, y: number, num: number, size: number = 48) {
  // Gold circle
  ctx.save();
  ctx.shadowColor = "rgba(203,163,68,0.4)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Number
  ctx.fillStyle = DARK;
  ctx.font = `700 ${size * 0.5}px GuideFont`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(num), x, y + 2);
  ctx.textBaseline = "alphabetic";
}

function drawIconBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, emoji: string) {
  ctx.fillStyle = SURFACE;
  ctx.strokeStyle = "rgba(203,163,68,0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  ctx.font = "400 40px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x + w / 2, y + h / 2);
  ctx.textBaseline = "alphabetic";
}

/* ── Content ── */

interface StepData {
  num: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  emoji: string;
}

const steps: StepData[] = [
  {
    num: 1,
    titleEn: "Visit the Platform",
    titleAr: "زيارة المنصة",
    descEn: 'Open your browser and go to www.shukranwatan.ae\nClick "Send Message" from the navigation bar or home page',
    descAr: 'افتح المتصفح وانتقل إلى www.shukranwatan.ae\nاضغط على "أرسل رسالة" من شريط التنقل أو الصفحة الرئيسية',
    emoji: "🌐",
  },
  {
    num: 2,
    titleEn: "Enter Your Name",
    titleAr: "أدخل اسمك",
    descEn: "Type your full name in the name field.\nThis will appear on your participation certificate.",
    descAr: "اكتب اسمك الكامل في حقل الاسم.\nسيظهر هذا على شهادة المشاركة الخاصة بك.",
    emoji: "✍️",
  },
  {
    num: 3,
    titleEn: "Enter Your Phone Number",
    titleAr: "أدخل رقم هاتفك",
    descEn: "Provide your phone number for verification.\nThis information is kept private and secure.",
    descAr: "أدخل رقم هاتفك للتحقق.\nيتم الحفاظ على هذه المعلومات خاصة وآمنة.",
    emoji: "📱",
  },
  {
    num: 4,
    titleEn: "Select Your Nationality & Emirate",
    titleAr: "اختر جنسيتك والإمارة",
    descEn: "Choose your country from the dropdown list.\nThen select the emirate you are based in.",
    descAr: "اختر بلدك من القائمة المنسدلة.\nثم اختر الإمارة التي تقيم فيها.",
    emoji: "🇦🇪",
  },
  {
    num: 5,
    titleEn: "Choose Your Category",
    titleAr: "اختر فئتك",
    descEn: "Select one: Citizen or Resident.\nThis helps us categorize participation.",
    descAr: "اختر واحداً: مواطن أو مقيم.\nهذا يساعدنا في تصنيف المشاركات.",
    emoji: "👤",
  },
  {
    num: 6,
    titleEn: "Write Your Thank You Message",
    titleAr: "اكتب رسالة شكرك",
    descEn: "Write a heartfelt message of gratitude (10-500 characters).\nYour words will be documented in the national record.",
    descAr: "اكتب رسالة شكر صادقة (10-500 حرف).\nستُوثق كلماتك في السجل الوطني.",
    emoji: "💬",
  },
  {
    num: 7,
    titleEn: "Record a Voice Message (Optional)",
    titleAr: "سجّل رسالة صوتية (اختياري)",
    descEn: "Tap the microphone icon to record up to 60 seconds.\nYou can preview and delete before submitting.",
    descAr: "اضغط على أيقونة الميكروفون للتسجيل حتى 60 ثانية.\nيمكنك المعاينة والحذف قبل الإرسال.",
    emoji: "🎙️",
  },
  {
    num: 8,
    titleEn: "Submit & Download Certificate",
    titleAr: "أرسل وحمّل الشهادة",
    descEn: 'Click "Document Message" to send.\nAfter success, download your participation certificate as an image.',
    descAr: 'اضغط "توثيق الرسالة" للإرسال.\nبعد النجاح، حمّل شهادة المشاركة كصورة.',
    emoji: "🏆",
  },
];

/* ── Page Renderers ── */

function renderCover(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  pageBg(ctx);
  pageBorder(ctx);

  // Top glow
  const topGlow = ctx.createRadialGradient(PW / 2, 200, 0, PW / 2, 200, 500);
  topGlow.addColorStop(0, "rgba(203,163,68,0.08)");
  topGlow.addColorStop(1, "transparent");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, PW, PH);

  ctx.textAlign = "center";
  let y = 180;

  // Logo
  if (logo) {
    const size = 180;
    const cx = PW / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.shadowColor = "rgba(203,163,68,0.5)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
    y += size + 40;
  }

  // Arabic title
  ctx.fillStyle = GOLD;
  ctx.font = "700 52px GuideFont";
  ctx.fillText("شكراً حماة الوطن", PW / 2, y);
  y += 50;

  // English title
  ctx.fillStyle = WHITE;
  ctx.font = "700 36px GuideFont";
  ctx.fillText("Thank You, Guardians of the Nation", PW / 2, y);
  y += 50;

  goldLine(ctx, y, 250);
  y += 50;

  // Guide title
  ctx.save();
  ctx.shadowColor = "rgba(203,163,68,0.35)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = GOLD;
  ctx.font = "700 44px GuideFont";
  ctx.fillText("USER GUIDE", PW / 2, y);
  ctx.restore();
  y += 36;

  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = "700 34px GuideFont";
  ctx.fillText("دليل المستخدم", PW / 2, y);
  y += 50;

  // Subtitle
  ctx.fillStyle = MUTED;
  ctx.font = "400 22px GuideFont";
  ctx.fillText("How to send your thank you message to the guardians of the UAE", PW / 2, y);
  y += 34;
  ctx.fillText("كيف ترسل رسالة شكرك لحماة الوطن", PW / 2, y);
  y += 70;

  // Decorative stars
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = "400 24px GuideFont";
  ctx.fillText("✦    ★    ✦    ★    ✦", PW / 2, y);
  y += 60;

  // Info box
  const bw = 700;
  const bh = 100;
  const bx = PW / 2 - bw / 2;
  ctx.fillStyle = "rgba(10,30,52,0.6)";
  ctx.strokeStyle = "rgba(203,163,68,0.3)";
  ctx.lineWidth = 1;
  roundRect(ctx, bx, y, bw, bh, 14);
  ctx.fill();
  roundRect(ctx, bx, y, bw, bh, 14);
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = "700 20px GuideFont";
  ctx.fillText("8 Simple Steps  ·  ٨ خطوات بسيطة", PW / 2, y + 40);
  ctx.fillStyle = MUTED;
  ctx.font = "400 17px GuideFont";
  ctx.fillText("Takes less than 2 minutes  ·  يستغرق أقل من دقيقتين", PW / 2, y + 70);

  pageFooter(ctx, 1, 3);
}

function renderStepsPage(
  ctx: CanvasRenderingContext2D,
  stepsSlice: StepData[],
  pageNum: number,
  totalPages: number,
  pageLabel: string
) {
  pageBg(ctx);
  pageBorder(ctx);

  ctx.textAlign = "center";

  // Page header
  ctx.fillStyle = GOLD;
  ctx.font = "700 32px GuideFont";
  ctx.fillText(pageLabel, PW / 2, 80);
  goldLine(ctx, 100, 200);

  // Grid: 2 columns x 2 rows for 4 steps
  const colW = (PW - 160) / 2;
  const rowH = (PH - 180) / 2;
  const startX = 80;
  const startY = 130;

  stepsSlice.forEach((step, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = startX + col * colW + colW / 2;
    const bx = startX + col * colW + 16;
    const by = startY + row * rowH + 16;
    const cardW = colW - 32;
    const cardH = rowH - 32;

    // Card background
    ctx.fillStyle = "rgba(10,30,52,0.7)";
    ctx.strokeStyle = "rgba(203,163,68,0.2)";
    ctx.lineWidth = 1;
    roundRect(ctx, bx, by, cardW, cardH, 16);
    ctx.fill();
    roundRect(ctx, bx, by, cardW, cardH, 16);
    ctx.stroke();

    // Top gold accent
    const accentG = ctx.createLinearGradient(bx, by, bx + cardW, by);
    accentG.addColorStop(0, "transparent");
    accentG.addColorStop(0.3, GOLD);
    accentG.addColorStop(0.7, GOLD);
    accentG.addColorStop(1, "transparent");
    ctx.strokeStyle = accentG;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 16, by);
    ctx.lineTo(bx + cardW - 16, by);
    ctx.stroke();

    let y = by + 40;

    // Step number + emoji row
    drawStepCircle(ctx, bx + 50, y + 4, step.num, 50);

    // Emoji box
    drawIconBox(ctx, bx + cardW - 90, y - 22, 56, 56, step.emoji);

    y += 50;

    // Titles
    ctx.textAlign = "start";
    ctx.fillStyle = GOLD;
    ctx.font = "700 24px GuideFont";
    ctx.fillText(step.titleEn, bx + 30, y);
    y += 32;

    ctx.fillStyle = GOLD_LIGHT;
    ctx.font = "700 22px GuideFont";
    ctx.fillText(step.titleAr, bx + 30, y);
    y += 40;

    // Descriptions
    ctx.fillStyle = MUTED;
    ctx.font = "400 17px GuideFont";
    const enLines = step.descEn.split("\n");
    for (const line of enLines) {
      ctx.fillText(line, bx + 30, y);
      y += 26;
    }

    y += 10;
    ctx.fillStyle = "rgba(143,164,184,0.7)";
    ctx.font = "400 16px GuideFont";
    const arLines = step.descAr.split("\n");
    for (const line of arLines) {
      // For Arabic text, right-align within card
      ctx.textAlign = "end";
      ctx.fillText(line, bx + cardW - 30, y);
      y += 24;
      ctx.textAlign = "start";
    }
  });

  ctx.textAlign = "center";
  pageFooter(ctx, pageNum, totalPages);
}

function renderTipsPage(ctx: CanvasRenderingContext2D, totalPages: number) {
  pageBg(ctx);
  pageBorder(ctx);

  ctx.textAlign = "center";
  let y = 90;

  // Header
  ctx.fillStyle = GOLD;
  ctx.font = "700 32px GuideFont";
  ctx.fillText("Tips & Important Notes  ·  نصائح وملاحظات مهمة", PW / 2, y);
  y += 20;
  goldLine(ctx, y, 300);
  y += 50;

  // Tips in two columns
  const tips = [
    {
      emoji: "📝",
      en: "Write from the heart — your message will be preserved in the national record forever.",
      ar: "اكتب من القلب — رسالتك ستُحفظ في السجل الوطني إلى الأبد.",
    },
    {
      emoji: "🌍",
      en: "Anyone from anywhere in the world can participate — not just UAE residents.",
      ar: "يمكن لأي شخص من أي مكان في العالم المشاركة — وليس فقط المقيمين في الإمارات.",
    },
    {
      emoji: "🏆",
      en: "You are contributing to a Guinness World Record for the most thank you messages!",
      ar: "أنت تساهم في رقم قياسي عالمي لأكبر عدد من رسائل الشكر!",
    },
    {
      emoji: "📜",
      en: "After sending, download your Certificate of Participation as a keepsake.",
      ar: "بعد الإرسال، حمّل شهادة المشاركة كذكرى.",
    },
    {
      emoji: "🎙️",
      en: "Voice messages add a personal touch — optional but recommended.",
      ar: "الرسائل الصوتية تضيف لمسة شخصية — اختيارية لكن موصى بها.",
    },
    {
      emoji: "🔒",
      en: "Your personal information is secure and will not be shared publicly.",
      ar: "معلوماتك الشخصية آمنة ولن يتم مشاركتها علنياً.",
    },
  ];

  const colW = (PW - 160) / 2;

  tips.forEach((tip, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bx = 80 + col * colW + 16;
    const by = y + row * 220;
    const cardW = colW - 32;
    const cardH = 195;

    // Card
    ctx.fillStyle = "rgba(10,30,52,0.7)";
    ctx.strokeStyle = "rgba(203,163,68,0.15)";
    ctx.lineWidth = 1;
    roundRect(ctx, bx, by, cardW, cardH, 14);
    ctx.fill();
    roundRect(ctx, bx, by, cardW, cardH, 14);
    ctx.stroke();

    // Emoji
    ctx.font = "400 36px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tip.emoji, bx + 40, by + 45);
    ctx.textBaseline = "alphabetic";

    // Green checkmark circle
    ctx.fillStyle = GREEN;
    ctx.beginPath();
    ctx.arc(bx + cardW - 30, by + 30, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.font = "700 14px GuideFont";
    ctx.textAlign = "center";
    ctx.fillText("✓", bx + cardW - 30, by + 35);

    // English text
    ctx.textAlign = "start";
    ctx.fillStyle = WHITE;
    ctx.font = "400 18px GuideFont";
    wrapText(ctx, tip.en, bx + 75, by + 40, cardW - 120, 26);

    // Arabic text
    ctx.textAlign = "end";
    ctx.fillStyle = "rgba(143,164,184,0.7)";
    ctx.font = "400 16px GuideFont";
    wrapText(ctx, tip.ar, bx + cardW - 20, by + 120, cardW - 50, 24, true);
  });

  // Bottom CTA
  const ctaY = y + 690;
  const ctaW = 600;
  const ctaH = 80;
  ctx.fillStyle = GOLD;
  roundRect(ctx, PW / 2 - ctaW / 2, ctaY, ctaW, ctaH, 40);
  ctx.fill();
  ctx.fillStyle = DARK;
  ctx.font = "700 24px GuideFont";
  ctx.textAlign = "center";
  ctx.fillText("Start Now  ·  ابدأ الآن  ·  www.shukranwatan.ae", PW / 2, ctaY + 48);

  pageFooter(ctx, totalPages, totalPages);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  rtl: boolean = false
) {
  const words = text.split(" ");
  let line = "";
  let ly = y;
  for (const word of words) {
    const test = line + (line ? " " : "") + word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, ly);
      line = word;
      ly += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, ly);
}

/* ── Main Export ── */

export async function downloadUserGuide() {
  await Promise.all([
    loadFont("/fonts/Cairo-Regular.ttf", "GuideFont", "400"),
    loadFont("/fonts/Cairo-Bold.ttf", "GuideFont", "700"),
  ]);

  let logo: HTMLImageElement | null = null;
  try {
    logo = await loadImage("/media/logo.jpeg");
  } catch {
    // proceed without logo
  }

  const canvas = document.createElement("canvas");
  canvas.width = PW;
  canvas.height = PH;
  const ctx = canvas.getContext("2d")!;

  const totalPages = 4;
  const doc = new jsPDF({ orientation: "landscape", unit: "px", format: [PW / 2, PH / 2] });

  // Page 1: Cover
  renderCover(ctx, logo);
  doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PW / 2, PH / 2);

  // Page 2: Steps 1-4
  doc.addPage();
  ctx.clearRect(0, 0, PW, PH);
  renderStepsPage(ctx, steps.slice(0, 4), 2, totalPages, "Steps 1–4  ·  الخطوات ١–٤");
  doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PW / 2, PH / 2);

  // Page 3: Steps 5-8
  doc.addPage();
  ctx.clearRect(0, 0, PW, PH);
  renderStepsPage(ctx, steps.slice(4, 8), 3, totalPages, "Steps 5–8  ·  الخطوات ٥–٨");
  doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PW / 2, PH / 2);

  // Page 4: Tips
  doc.addPage();
  ctx.clearRect(0, 0, PW, PH);
  renderTipsPage(ctx, totalPages);
  doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PW / 2, PH / 2);

  // Add clickable links on every page footer where the URL is displayed
  const url = "https://www.shukranwatan.ae";
  const linkW = 200;
  const linkH = 20;
  const linkX = PW / 4 - linkW / 2; // centered in the half-size page
  const linkY = PH / 2 - 35;        // footer area

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.link(linkX, linkY, linkW, linkH, { url });
  }

  // Cover page: also make the CTA info box area clickable
  doc.setPage(1);
  // Steps page 1: step 1 mentions the URL
  doc.setPage(2);
  const step1LinkX = 80 / 2 + 30 / 2; // approximate position scaled to half
  doc.link(step1LinkX, 200, 300, 20, { url });

  // Tips page: CTA button is clickable
  doc.setPage(4);
  const ctaBtnX = PW / 4 - 300 / 2;
  const ctaBtnY = (90 + 50 + 690) / 2;
  doc.link(ctaBtnX, ctaBtnY, 300, 40, { url });

  doc.save("shukran-user-guide.pdf");
}
