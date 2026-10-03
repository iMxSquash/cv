import { CvIcon } from "@/components/icons/CvIcon";
import { AssetImage } from "@/components/ui/AssetImage";

interface IconTileProps {
  name: string;
  /** Size and radius of the tile, in points. */
  className: string;
  iconClassName: string;
  /** Uploaded logo replacing the icon placeholder. */
  imageUrl?: string | null;
}

/** Icon centered on a light gray tile (contacts, mobility), or the uploaded logo when there is one. */
export function IconTile({ name, className, iconClassName, imageUrl }: IconTileProps) {
  if (imageUrl) return <AssetImage src={imageUrl} className={className} />;
  return (
    <span className={`grid shrink-0 place-items-center bg-line text-text-muted ${className}`}>
      <CvIcon name={name} className={iconClassName} />
    </span>
  );
}
