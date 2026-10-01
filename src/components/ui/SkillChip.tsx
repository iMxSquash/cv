interface SkillChipProps {
  label: string;
  details: string[];
}

export function SkillChip({ label, details }: SkillChipProps) {
  return (
    <span className="flex min-h-11 flex-col items-center justify-center rounded-xl bg-surface-raised px-4 py-2 text-center shadow-sm">
      <span className="font-medium text-accent">{label}</span>
      {details.length > 0 && (
        <span className="text-caption text-text-muted">+ {details.join(", ")}</span>
      )}
    </span>
  );
}
