import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';

export default Factory.extend({
  package_name: () => faker.internet.domainName(),
  region: () => faker.location.countryCode(),
  version: () => faker.system.semver(),
  store: () => faker.helpers.arrayElement(['appstore', 'playstore']),
  score: () => faker.number.int({ min: 0, max: 100 }),

  risk_status: () =>
    faker.helpers.arrayElement(
      Object.values(ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS)
    ),

  scan_date: () => faker.date.recent().toISOString(),
  title: () => faker.company.name(),
  icon_url: () => faker.image.url(),
  dev_name: () => faker.person.fullName(),
  app_url: () => faker.internet.url(),
  platform: () => faker.number.int({ min: 0, max: 1 }),
  presigned_url: () => faker.internet.url(),
  versions: () => [faker.system.semver()],

  findings: () => [
    {
      rule_id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      severity: faker.helpers.arrayElement([
        'critical',
        'high',
        'medium',
        'low',
        'info',
      ]),
      status: faker.helpers.arrayElement([
        'triggered',
        'clean',
        'error',
        'skipped',
      ]),
      details: [faker.lorem.sentence()],
      skip_reason: null,
      category: faker.lorem.word(),
      contributes_to_score: faker.datatype.boolean(),
      checks: faker.lorem.sentence(),
      business_impact: faker.lorem.sentence(),
      is_potential_risk: faker.datatype.boolean(),
    },
  ],
});
