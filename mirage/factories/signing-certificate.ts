/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error "trait" prop missing from miragejs
import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  name: () => `${faker.company.name()} iOS`,
  team_id: () => faker.string.alphanumeric({ length: 10, casing: 'upper' }),
  app_id: () => faker.internet.domainName(),
  bundle_id: () => faker.internet.domainName(),
  is_active: false,
  is_expired: false,
  provisions_all_devices: false,
  provisioned_udids: () => [],
  expires_at: () => faker.date.future().toISOString(),

  active: trait({
    is_active: true,
  }),

  expired: trait({
    is_expired: true,
    expires_at: () => faker.date.past().toISOString(),
  }),

  enterprise: trait({
    provisions_all_devices: true,
  }),

  unnamed: trait({
    name: null,
  }),
});
