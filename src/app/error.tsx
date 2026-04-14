"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 min-h-[50vh]">
      <h1 className="text-4xl font-bold" style={{ color: 'var(--red)' }}>خطأ</h1>
      <p style={{ color: 'var(--muted)' }}>حدث خطأ غير متوقع</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 rounded-full bg-[var(--gold)] text-[var(--bg-deep)] font-bold mt-4"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}
