// Flag artwork keeps its official colors: these are not theme tokens.
const FLAGS: Record<string, React.ReactNode> = {
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
};

/** Decorative flag next to the language name; unknown codes render nothing. */
export function Flag({ code }: { code: string }) {
  const artwork = FLAGS[code];
  if (!artwork) return null;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      className="h-4 w-6 shrink-0 rounded-sm"
    >
      {artwork}
    </svg>
  );
}
