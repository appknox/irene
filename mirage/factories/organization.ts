/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error "trait" prop missing from miragejs
import { trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  name: faker.company.name(),
  userCount: faker.number.int(),
  teamCount: faker.number.int(),
  invitationCount: faker.number.int(),
  projects_count: faker.number.int(),
  cyod_registration_enabled: false,

  withCyodEnabled: trait({
    features: () => ({ cyod: true }),
    cyod_registration_enabled: true,
  }),

  withCyodRegistrationDisabled: trait({
    features: () => ({ cyod: true }),
    cyod_registration_enabled: false,
  }),
});
