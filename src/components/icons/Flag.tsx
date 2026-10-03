// Flag artwork keeps its official colors: these are not theme tokens.
const FLAGS = {
  fr: (
    <>
      <rect width="20" height="30" fill="#002654" />
      <rect x="20" width="20" height="30" fill="#ffffff" />
      <rect x="40" width="20" height="30" fill="#ed2939" />
    </>
  ),
  gb: (
    <>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 60 30M60 0 0 30" stroke="#ffffff" strokeWidth="6" />
      <path d="M0 0 60 30M60 0 0 30" stroke="#c8102e" strokeWidth="2" />
      <path d="M30 0v30M0 15h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
    </>
  ),
} satisfies Record<string, React.ReactNode>;

type FlagCode = keyof typeof FLAGS;

export const FLAG_CODES = Object.keys(FLAGS) as [FlagCode, ...FlagCode[]];

function isFlagCode(code: string): code is FlagCode {
  return Object.hasOwn(FLAGS, code);
}

/** Decorative flag next to the language name; unknown codes render nothing. */
export function Flag({ code, className = "h-4 w-6" }: { code: string; className?: string }) {
  if (!isFlagCode(code)) return null;
  const artwork = FLAGS[code];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      className={`shrink-0 rounded-sm ${className}`}
    >
      {artwork}
    </svg>
  );
}
