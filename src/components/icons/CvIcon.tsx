import {
  IconBrandAdobe,
  IconBrandFigma,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandVscode,
  IconBriefcase,
  IconCampfire,
  IconCar,
  IconCode,
  IconDownload,
  IconHome,
  IconLink,
  IconMail,
  IconMapPin,
  IconPalette,
  IconPhone,
  IconPrinter,
  IconSchool,
  IconTrain,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";

// Keys stored in Supabase (`icon_key`, `platform`, skill `category`) plus interface icons. The admin
// picks from these keys: icons are never uploaded (no stored SVG).
const ICONS: Record<string, Icon> = {
  adobe: IconBrandAdobe,
  briefcase: IconBriefcase,
  car: IconCar,
  design: IconPalette,
  development: IconCode,
  download: IconDownload,
  figma: IconBrandFigma,
  freecodecamp: IconCampfire,
  github: IconBrandGithub,
  home: IconHome,
  linkedin: IconBrandLinkedin,
  location: IconMapPin,
  mail: IconMail,
  metro: IconTrain,
  phone: IconPhone,
  printer: IconPrinter,
  school: IconSchool,
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
