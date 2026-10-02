import { CvIcon } from "@/components/icons/CvIcon";

interface IconTileProps {
  name: string;
  /** Size and radius of the tile, in points. */
  className: string;
  iconClassName: string;
}

/** Icon centered on a light gray tile, the Figma placeholder for contacts, logos and mobility. */
export function IconTile({ name, className, iconClassName }: IconTileProps) {
  return (
    <span className={`grid shrink-0 place-items-center bg-line text-text-muted ${className}`}>
      <CvIcon name={name} className={iconClassName} />
    </span>
  );
}
