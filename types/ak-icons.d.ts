import {
  MaterialSymbolsSet,
  MdiIconsSet,
  HugeIconsSet,
  FaBrandsIconsSet,
  IcIconsSet,
  BxIconsSet,
  PhIconsSet,
  MynauiIconsSet,
  SolarIconsSet,
  IconoirIconsSet,
  IconParkOutlineIconsSet,
  FluentIconsSet,
  StreamlinePlumpIconsSet,
  IxIconsSet,
  MajesticonsIconsSet,
  MiIconsSet,
} from 'irene/utils/icons';

type MaterialSymbolsIcon = (typeof MaterialSymbolsSet)[number];
type MdiIcon = (typeof MdiIconsSet)[number];
type HugeIcon = (typeof HugeIconsSet)[number];
type FaBrandsIcon = (typeof FaBrandsIconsSet)[number];
type IcIcon = (typeof IcIconsSet)[number];
type BxIcon = (typeof BxIconsSet)[number];
type PhIcon = (typeof PhIconsSet)[number];
type MynauiIcon = (typeof MynauiIconsSet)[number];
type SolarIcon = (typeof SolarIconsSet)[number];
type IconoirIcon = (typeof IconoirIconsSet)[number];
type IconParkOutlineIcon = (typeof IconParkOutlineIconsSet)[number];
type FluentIcon = (typeof FluentIconsSet)[number];
type StreamlinePlumpIcon = (typeof StreamlinePlumpIconsSet)[number];
type IxIcon = (typeof IxIconsSet)[number];
type MajesticonsIcon = (typeof MajesticonsIconsSet)[number];
type MiIcon = (typeof MiIconsSet)[number];

export const AkIconsSet = [
  ...MaterialSymbolsSet,
  ...MdiIconsSet,
  ...HugeIconsSet,
  ...FaBrandsIconsSet,
  ...IcIconsSet,
  ...BxIconsSet,
  ...PhIconsSet,
  ...MynauiIconsSet,
  ...SolarIconsSet,
  ...IconoirIconsSet,
  ...IconParkOutlineIconsSet,
  ...FluentIconsSet,
  ...StreamlinePlumpIconsSet,
  ...IxIconsSet,
  ...MajesticonsIconsSet,
  ...MiIconsSet,
] as const;

export type AkIconVariantType =
  | `mdi:${MdiIcon}`
  | `hugeicons:${HugeIcon}`
  | `fa-brands:${FaBrandsIcon}`
  | `ic:${IcIcon}`
  | `bx:${BxIcon}`
  | `ph:${PhIcon}`
  | `mynaui:${MynauiIcon}`
  | `solar:${SolarIcon}`
  | `iconoir:${IconoirIcon}`
  | `icon-park-outline:${IconParkOutlineIcon}`
  | `fluent:${FluentIcon}`
  | `streamline-plump:${StreamlinePlumpIcon}`
  | `ix:${IxIcon}`
  | `majesticons:${MajesticonsIcon}`
  | `mi:${MiIcon}`
  | MaterialSymbolsIcon;

// Export the icon types for reference
export type {
  MaterialSymbolsIcon,
  MdiIcon,
  HugeIcon,
  FaBrandsIcon,
  IcIcon,
  BxIcon,
  PhIcon,
  MynauiIcon,
  SolarIcon,
  IconoirIcon,
  IconParkOutlineIcon,
  FluentIcon,
  StreamlinePlumpIcon,
  IxIcon,
  MajesticonsIcon,
  MiIcon,
};
