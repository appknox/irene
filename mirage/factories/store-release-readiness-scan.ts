import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';

export default Factory.extend({
  id: (i) => i + 1,
  file: (i) => i + 1,
  file_name: () => faker.system.fileName(),
  project_id: (i) => i + 1,
  package_name: () =>
    `com.${faker.internet.domainWord()}.${faker.internet.domainWord()}`,
  platform: () =>
    faker.helpers.arrayElement([ENUMS.PLATFORM.ANDROID, ENUMS.PLATFORM.IOS]),
  status: () =>
    faker.helpers.arrayElement(ENUMS.STORE_RELEASE_SCAN_STATUS.BASE_VALUES),
  verdict: () =>
    faker.helpers.arrayElement(ENUMS.STORE_RELEASE_VERDICT.BASE_VALUES),
  verdict_display: () => faker.commerce.productDescription(),
  total_checks: () => faker.number.int({ min: 5, max: 80 }),
  passed_count: () => faker.number.int({ min: 0, max: 60 }),
  failed_count: () => faker.number.int({ min: 0, max: 20 }),
  blocker_count: () => faker.number.int({ min: 0, max: 10 }),
  warning_count: () => faker.number.int({ min: 0, max: 15 }),
  untested_count: () => faker.number.int({ min: 0, max: 25 }),
  overridden_count: () => faker.number.int({ min: 0, max: 10 }),
  created_at: () => faker.date.past().toString(),
  completed_at: () => faker.date.recent().toString(),
  icon_url: () => faker.image.avatar(),
  error_message: () =>
    faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.15 }) ??
    null,
  updated_at: () => faker.date.recent().toString(),
  findings(i) {
    return Array.from(
      { length: faker.number.int({ min: 1, max: 6 }) },
      (_, j) => ({
        id: (i + 1) * 1000 + j,
        check_id: `srr-${faker.string.alphanumeric({ length: 8 }).toLowerCase()}`,
        title: faker.lorem.sentence(),
        category: faker.helpers.arrayElement([
          'Privacy',
          'Security',
          'Compliance',
          'Data',
        ]),
        severity: faker.helpers.arrayElement(
          ENUMS.STORE_RELEASE_FINDING_SEVERITY.BASE_VALUES
        ),
        passed: faker.helpers.arrayElement([true, false, null]),
        evidence: faker.lorem.sentence(),
        remediation_steps: faker.helpers.multiple(
          () => faker.lorem.sentence(),
          { count: { min: 1, max: 3 } }
        ),
        guideline_reference: faker.internet.url(),
        platform: faker.helpers.arrayElement([
          ENUMS.PLATFORM.ANDROID,
          ENUMS.PLATFORM.IOS,
        ]),
        explanation: faker.lorem.paragraph(),
        source: faker.lorem.words(2),
        field_checked: faker.lorem.words(4),
        expected: faker.lorem.sentence(),
        signal_enriched: faker.datatype.boolean(),
        enrichment_details: {},
        is_overridden: faker.datatype.boolean(),
        overridden_by: faker.helpers.maybe(() => faker.internet.email(), {
          probability: 0.2,
        }),
        overridden_at: faker.helpers.maybe(
          () => faker.date.recent().toString(),
          {
            probability: 0.2,
          }
        ),
        override_comment: faker.lorem.sentence(),
        created_at: faker.date.past().toString(),
      })
    );
  },
});
