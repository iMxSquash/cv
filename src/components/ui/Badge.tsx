export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-badge px-2.5 py-0.5 text-caption font-medium text-badge-text">
      {children}
    </span>
  );
}
