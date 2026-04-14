export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
      <div className="w-16 h-16 border-4 border-t-[var(--gold)] rounded-full animate-spin" style={{ borderColor: 'var(--surface-2)', borderTopColor: 'var(--gold)' }}></div>
    </div>
  );
}
