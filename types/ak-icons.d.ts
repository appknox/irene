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
  FluentIconsSet,
  StreamlinePlumpIconsSet,
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
type FluentIcon = (typeof FluentIconsSet)[number];
type StreamlinePlumpIcon = (typeof StreamlinePlumpIconsSet)[number];

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
  ...FluentIconsSet,
  ...StreamlinePlumpIconsSet,
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
  | `fluent:${FluentIcon}`
  | `streamline-plump:${StreamlinePlumpIcon}`
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
  FluentIcon,
  StreamlinePlumpIcon,
};
