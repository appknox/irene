import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i: number) {
    return i + 1;
  },

  name: () => faker.lorem.slug(),
  version: () => faker.system.semver(),
  latest_version: () => '',
  component_type: () =>
    faker.helpers.arrayElement(['library', 'framework', 'file']),
  purl_type: () => faker.helpers.arrayElement(['maven', 'npm', 'pypi']),
  namespace: () => faker.internet.domainWord(),
  status: () => faker.helpers.arrayElement(['VULNERABLE', 'SECURE']),

  bom_ref: () => `maven::${faker.internet.domainWord()}:${faker.lorem.slug()}`,
});
