interface SkillChipProps {
  label: string;
  details: string[];
  className?: string;
}

export function SkillChip({ label, details, className = "" }: SkillChipProps) {
  return (
    <span
      className={`flex min-h-11 flex-col items-center justify-center rounded-xl bg-surface-raised px-4 py-2 text-center shadow-sm ${className}`}
    >
      <span className="font-medium text-accent">{label}</span>
      {details.length > 0 && (
        <span className="text-caption text-text-muted">+ {details.join(", ")}</span>
      )}
    </span>
  );
}
