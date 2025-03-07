import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const BASE_COMPONENT_ID = 100;

export default Factory.extend({
  id(i: number) {
    return BASE_COMPONENT_ID + i + 1;
  },

  // Basic component information
  name: () => faker.lorem.slug(),
  author: () => faker.person.firstName(),
  type: () => faker.helpers.arrayElement(['library', 'framework']),
  version: () => faker.system.semver(),
  has_children: false,
  dependency_count: 0,
  is_dependency: false,

  // Version handling
  latest_version() {
    const version = this.version as string;

    return faker.helpers.arrayElement([version, faker.system.semver()]);
  },

  // Reference and ecosystem info
  bom_ref() {
    const namespace = faker.helpers.arrayElement([
      'maven',
      'npm',
      'pypi',
      'nuget',
    ]);
    const group = faker.string.alphanumeric(10).toLowerCase();
    const name = faker.string.alphanumeric(10).toLowerCase();

    return `${namespace}::${group}:${name}`;
  },

  properties() {
    return [
      {
        'appknox:component:ecosystem': faker.lorem.word(),
      },
    ];
  },

  // License and security info
  licenses() {
    return faker.helpers.arrayElements([
      'Apache-2.0 AND (MIT OR GPL-2.0-only)',
      'GPL v3',
      'MIT',
      'AGPL v3',
    ]);
  },

  remediation: () => faker.lorem.paragraphs(),
});
