import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';

export const DEVICE_FACTORY_DEF = {
  state: () => faker.helpers.arrayElement(['available', 'busy', 'offline']),

  device_identifier: () =>
    faker.string.alphanumeric({ length: 7, casing: 'upper' }),

  address: () => faker.internet.ip(),
  is_connected: () => faker.datatype.boolean(),
  is_active: () => faker.datatype.boolean(),
  is_tablet: () => faker.datatype.boolean(),
  is_reserved: () => faker.datatype.boolean(),
  platform: () => faker.helpers.arrayElement(ENUMS.PLATFORM.BASE_VALUES),
  platform_version: () => faker.system.semver(),
  cpu_architecture: () =>
    faker.helpers.arrayElement(['arm64', 'x86_64', 'arm']),
  model: () => faker.helpers.arrayElement(['iPhone', 'iPad', 'Pixel']),
  has_sim: () => faker.datatype.boolean(),
  sim_network: () => faker.company.name(),
  sim_phone_number: () => faker.phone.number(),
  has_pin_lock: () => faker.datatype.boolean(),
  has_vpn: () => faker.datatype.boolean(),
  vpn_package_name: () => faker.system.commonFileName(),
  has_persistent_apps: () => faker.datatype.boolean(),
  persistent_apps: () => [],
  has_vnc: () => faker.datatype.boolean(),
};

export default Factory.extend(DEVICE_FACTORY_DEF);
