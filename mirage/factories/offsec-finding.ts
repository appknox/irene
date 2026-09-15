import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const OUTCOMES = ['bypassed', 'resisted', 'error', 'not_attempted'];
const BANDS = ['weak', 'moderate', 'strong', 'very_strong'];

export default Factory.extend({
  id: (i) => i + 1,
  signature_id: () =>
    `sig-${faker.string.alphanumeric({ length: 8 }).toLowerCase()}`,
  name: () => faker.lorem.words(3),
  category: () =>
    faker.helpers.arrayElement([
      'root_detection',
      'ssl_pinning',
      'debugger_detection',
      'emulator_detection',
    ]),
  check_type: () => 'runtime',
  detected: () => faker.datatype.boolean(),
  outcome: () => faker.helpers.arrayElement(OUTCOMES),
  score: () => faker.number.int({ min: 0, max: 100 }),
  band: () => faker.helpers.arrayElement(BANDS),
  rationale: () => faker.lorem.sentence(),
  order: (i) => i,
  evidence_ids: () => ['E1', 'E2'],

  detail() {
    return {};
  },

  evidence(i) {
    return Array.from({ length: 2 }, (_, j) => ({
      id: (i + 1) * 100 + j,
      evidence_id: `E${j + 1}`,
      step: j + 1,
      source: 'agent',
      strength: faker.helpers.arrayElement(['weak', 'strong']),
      tool: faker.helpers.arrayElement(['frida', 'adb', 'objection']),
      ok: true,
      summary: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      error: '',
      metadata: {},
    }));
  },
});
