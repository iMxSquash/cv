import {
  IconBrandAdobe,
  IconBrandFigma,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandVscode,
  IconCampfire,
  IconCar,
  IconHome,
  IconLink,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTrain,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";

// Keys stored in Supabase (`icon_key`, `platform`) plus contact rows. The admin
// picks from these keys: icons are never uploaded (no stored SVG).
const ICONS: Record<string, Icon> = {
  adobe: IconBrandAdobe,
  car: IconCar,
  figma: IconBrandFigma,
  freecodecamp: IconCampfire,
  github: IconBrandGithub,
  home: IconHome,
  linkedin: IconBrandLinkedin,
  location: IconMapPin,
  mail: IconMail,
  metro: IconTrain,
  phone: IconPhone,
  vscode: IconBrandVscode,
  website: IconWorld,
};

interface CvIconProps {
  name: string;
  className?: string;
}

/** Decorative icon: the text next to it always carries the meaning. */
export function CvIcon({ name, className = "size-5" }: CvIconProps) {
  const Component = ICONS[name] ?? IconLink;
  return <Component aria-hidden="true" className={className} stroke={1.75} />;
}
