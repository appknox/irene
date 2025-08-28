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
};

// Write output JSON
const outputFile = path.resolve('./public/ak-icons.json');
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(
  `✅ Generated icons for ${Object.keys(output).length} sets in ${outputFile}`
);
