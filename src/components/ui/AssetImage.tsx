import Image from "next/image";

// Logos and avatar are shown at most ~64 CSS px: 128 covers 2x screens and print.
const INTRINSIC_SIZE = 128;

interface AssetImageProps {
  src: string;
  className: string;
}

/** Image uploaded from /admin (`cv-assets`), decorative: the name next to it carries the meaning. */
export function AssetImage({ src, className }: AssetImageProps) {
  return (
    <Image
      src={src}
      alt=""
      width={INTRINSIC_SIZE}
      height={INTRINSIC_SIZE}
      className={`shrink-0 object-cover ${className}`}
    />
  );
}
