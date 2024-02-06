import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return 100 + i + 1;
  },

  name: () => faker.lorem.slug(),
  author: () => faker.person.firstName(),
  type: () => faker.helpers.arrayElement(['library', 'framework']),
  version: () => faker.system.semver(),

  latest_version() {
    const version = this.version as string;

    return faker.helpers.arrayElement([version, faker.system.semver()]);
  },

  properties() {
    return [
      {
        'appknox:component:ecosystem': faker.lorem.word(),
      },
    ];
  },

  licenses() {
    return faker.helpers.arrayElements([
      'Apache-2.0 AND (MIT OR GPL-2.0-only)',
      'GPL v3',
      'MIT',
      'AGPL v3',
    ]);
  },

  vulnerabilities_count() {
    return faker.helpers.arrayElement([faker.number.int(1000), 0]);
  },

  remediation: () => faker.lorem.paragraphs(),
});
