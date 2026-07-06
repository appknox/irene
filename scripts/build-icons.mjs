import fs from 'fs';
import path from 'path';
import { getIcons } from '@iconify/utils';
import { icons as MaterialSymbolIcons } from '@iconify-json/material-symbols';
import { icons as MaterialDesignIcons } from '@iconify-json/mdi';
import { icons as HugeIcons } from '@iconify-json/hugeicons';
import { icons as FaBrandsIcons } from '@iconify-json/fa-brands';
import { icons as IcIcons } from '@iconify-json/ic';
import { icons as BxIcons } from '@iconify-json/bx';
import { icons as PhIcons } from '@iconify-json/ph';
import { icons as MynauiIcons } from '@iconify-json/mynaui';
import { icons as SolarIcons } from '@iconify-json/solar';
import { icons as IconoirIcons } from '@iconify-json/iconoir';
import { icons as FluentIcons } from '@iconify-json/fluent';
import { icons as StreamlinePlumpIcons } from '@iconify-json/streamline-plump';
import { icons as IxIcons } from '@iconify-json/ix';
import { icons as MajesticonsIcons } from '@iconify-json/majesticons';
import { icons as MiIcons } from '@iconify-json/mi';

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
  IxIconsSet,
  MajesticonsIconsSet,
  MiIconsSet,
} from '../app/utils/icons.ts';

// Load all icon sets
const materialSymbolsCollection = getIcons(
  MaterialSymbolIcons,
  MaterialSymbolsSet
);

const mdiCollection = getIcons(MaterialDesignIcons, MdiIconsSet);
const hugeIconsCollection = getIcons(HugeIcons, HugeIconsSet);
const faBrandsCollection = getIcons(FaBrandsIcons, FaBrandsIconsSet);
const icCollection = getIcons(IcIcons, IcIconsSet);
const bxCollection = getIcons(BxIcons, BxIconsSet);
const phCollection = getIcons(PhIcons, PhIconsSet);
const mynauiCollection = getIcons(MynauiIcons, MynauiIconsSet);
const solarCollection = getIcons(SolarIcons, SolarIconsSet);
const iconoirCollection = getIcons(IconoirIcons, IconoirIconsSet);
const fluentCollection = getIcons(FluentIcons, FluentIconsSet);

const streamlinePlumpCollection = getIcons(
  StreamlinePlumpIcons,
  StreamlinePlumpIconsSet
);

const ixCollection = getIcons(IxIcons, IxIconsSet);

const majesticonsCollection = getIcons(MajesticonsIcons, MajesticonsIconsSet);

const miCollection = getIcons(MiIcons, MiIconsSet);

// Merge everything into one big object
const output = {
  materialSymbolsCollection,
  mdiCollection,
  hugeIconsCollection,
  faBrandsCollection,
  icCollection,
  bxCollection,
  phCollection,
  mynauiCollection,
  solarCollection,
  iconoirCollection,
  fluentCollection,
  streamlinePlumpCollection,
  ixCollection,
  majesticonsCollection,
  miCollection,
};

// Write output JSON
const outputFile = path.resolve('./public/ak-icons.json');
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(
  `✅ Generated icons for ${Object.keys(output).length} sets in ${outputFile}`
);
