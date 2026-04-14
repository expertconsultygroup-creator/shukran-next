export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-[1px] w-full ${className}`}
      style={{
        background: "linear-gradient(90deg, transparent, var(--gold) 50%, transparent)",
      }}
    />
  );
}
