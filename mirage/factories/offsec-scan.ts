import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';

const OUTCOMES = ['bypassed', 'resisted', 'error', 'not_attempted'];
const BANDS = ['weak', 'moderate', 'strong', 'very_strong'];

// The four counters describe one set of mechanisms, so they are derived from the record
// index instead of rolled independently: every detected protection is either assessed or
// not, and only an assessed one can have been bypassed. Independent randoms would let
// the mock claim more bypasses than there are protections.
const detectedFor = (i: number) => 6 + (i % 5);
const unassessedFor = (i: number) => i % 3;
const assessedFor = (i: number) => detectedFor(i) - unassessedFor(i);

export default Factory.extend({
  id: (i) => i + 1,
  file_id: (i) => i + 1,
  project_id: (i) => i + 1,
  package_name: () =>
    `com.${faker.internet.domainWord()}.${faker.internet.domainWord()}`,
  app_name: () => faker.commerce.productName(),
  version: () => faker.system.semver(),
  platform: () => faker.helpers.arrayElement(['android', 'ios']),
  status: () =>
    faker.helpers.arrayElement(ENUMS.OFFSEC_SCAN_STATUS.BASE_VALUES),
  status_reason: () => '',
  objective: () => faker.lorem.sentence(),
  device_serial: () => `emulator-${faker.number.int({ min: 5554, max: 5600 })}`,
  risk_rating: () =>
    faker.helpers.arrayElement(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  overall_resilience: () => faker.number.int({ min: 0, max: 100 }),
  resilience_band: () => faker.helpers.arrayElement(BANDS),
  protections_detected: (i) => detectedFor(i),
  protections_bypassed: (i) => assessedFor(i) % 4,
  findings_assessed: (i) => assessedFor(i),
  findings_unassessed: (i) => unassessedFor(i),
  error_message: () => null,
  completed_at: () => faker.date.recent().toString(),
  created_at: () => faker.date.past().toString(),
  updated_at: () => faker.date.recent().toString(),

  // The agent's narrative envelope, not the headline numbers — those are flattened onto
  // the top level of the scan payload.
  summary() {
    return {
      claim: faker.lorem.sentence(),
      confidence: faker.helpers.arrayElement(['low', 'medium', 'high']),
      evidence_count: faker.number.int({ min: 1, max: 20 }),
    };
  },

  // Metadata only — download URLs are minted per request by the API.
  artifacts() {
    return [
      {
        name: 'report.json',
        size: faker.number.int({ min: 1024, max: 65536 }),
        content_type: 'application/json',
      },
      {
        name: 'agent.log',
        size: faker.number.int({ min: 1024, max: 65536 }),
        content_type: 'text/plain',
      },
    ];
  },

  findings(i) {
    return Array.from(
      { length: faker.number.int({ min: 1, max: 5 }) },
      (_, j) => ({
        id: (i + 1) * 1000 + j,
        signature_id: `sig-${faker.string.alphanumeric({ length: 8 }).toLowerCase()}`,
        name: faker.lorem.words(3),
        category: faker.helpers.arrayElement([
          'root_detection',
          'ssl_pinning',
          'debugger_detection',
          'emulator_detection',
        ]),
        check_type: 'runtime',
        detected: faker.datatype.boolean(),
        outcome: faker.helpers.arrayElement(OUTCOMES),
        score: faker.number.int({ min: 0, max: 100 }),
        band: faker.helpers.arrayElement(BANDS),
        rationale: faker.lorem.sentence(),
        order: j,
        evidence_ids: [`E${j * 2 + 1}`, `E${j * 2 + 2}`],
      })
    );
  },
});
