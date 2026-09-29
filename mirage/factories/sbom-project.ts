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

  // History-mode fields (only returned when ?history=true, so null by
  // default — override per-test when exercising history rows)
  sb_file: () => null,

  vulnerabilities_count: () => null,

  status: () => null,

  composition_scan_completed_at: () => null,

  vulnerability_scan_completed_at: () => null,
};

export default Factory.extend(SBOM_PROJECT_FACTORY_DEF);
