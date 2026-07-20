import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';

export default Factory.extend({
  id: (i) => i + 1,
  check_id: () =>
    `srr-${faker.string.alphanumeric({ length: 10 }).toLowerCase()}`,
  title: () => faker.lorem.sentence(),
  category: () =>
    faker.helpers.arrayElement(['Privacy', 'Security', 'Compliance', 'Data']),
  severity: () =>
    faker.helpers.arrayElement(
      ENUMS.STORE_RELEASE_FINDING_SEVERITY.BASE_VALUES
    ),
  passed: () => faker.helpers.arrayElement([true, false, null]),
  is_overridden: () => faker.datatype.boolean(),
  override_comment: () =>
    faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.35 }) ??
    null,
  evidence: () => faker.lorem.sentence(),
  remediation_steps: () =>
    faker.helpers.multiple(() => faker.lorem.sentence(), {
      count: { min: 1, max: 4 },
    }),
  guideline_reference: () => faker.internet.url(),
  explanation: () => faker.lorem.paragraph(),
  source: () => faker.lorem.words(2),
  field_checked: () => faker.lorem.words(4),
  expected: () => faker.lorem.sentence(),
});
