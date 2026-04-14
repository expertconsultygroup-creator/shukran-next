import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 min-h-[50vh]">
      <h1 className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>404</h1>
      <p style={{ color: 'var(--muted)' }}>الصفحة غير موجودة</p>
      <Link href="/" className="text-[var(--gold)] hover:underline mt-4">
        العودة للرئيسية
      </Link>
    </div>
  );
}
