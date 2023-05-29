import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  id(i) {
    return 100 + i + 1;
  },

  name: () => faker.lorem.slug(),
  author: () => faker.name.firstName(),
  type: () => faker.random.arrayElement(['library', 'framework']),
  version: () => faker.system.semver(),

  latest_version() {
    return faker.random.arrayElement([this.version, faker.system.semver()]);
  },

  properties() {
    return [
      {
        'appknox:component:ecosystem': faker.lorem.word(),
      },
    ];
  },

  licenses() {
    return faker.random.arrayElements([
      'Apache-2.0 AND (MIT OR GPL-2.0-only)',
      'GPL v3',
      'MIT',
      'AGPL v3',
    ]);
  },

  vulnerabilities_count() {
    return faker.random.arrayElement([faker.datatype.number(1000), 0]);
  },

  remediation: () => faker.lorem.paragraphs(),
});
