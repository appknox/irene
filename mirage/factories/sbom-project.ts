import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export const SBOM_PROJECT_FACTORY_DEF = {
  id(i: number) {
    return 1000 + i + 1;
  },

  project(i: number) {
    return i + 1;
  },

  latest_sb_file(i: number) {
    return 100 + i + 1;
  },

  name: () => faker.commerce.productName(),

  package_name: () => faker.internet.domainName(),

  icon_url: () => faker.image.url(),

  last_sca_analysis_on: () => faker.date.past().toISOString(),

  // Common field (returned in both default and history modes)
  dependency_type: () => faker.helpers.arrayElement(['direct', 'transitive']),

  // History-mode fields
  sb_file: () => faker.number.int({ min: 1, max: 100 }),

  vulnerabilities_count: () => faker.number.int({ min: 0, max: 20 }),

  status: () => faker.helpers.arrayElement(['VULNERABLE', 'SECURE']),

  composition_scan_completed_at: () => faker.date.past().toISOString(),

  vulnerability_scan_completed_at: () => faker.date.past().toISOString(),
};

export default Factory.extend(SBOM_PROJECT_FACTORY_DEF);
