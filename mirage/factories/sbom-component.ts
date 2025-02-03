import { Factory, Server } from 'miragejs';
import { faker } from '@faker-js/faker';
import { ModelInstance } from 'miragejs/-types';

interface SbomComponent extends ModelInstance {
  id: string;
  name: string;
  author: string;
  type: string;
  version: string;
  bom_ref: string;
  latest_version: string;
  properties: Array<{ 'appknox:component:ecosystem': string }>;
  licenses: string[];
  vulnerabilities_count: number;
  remediation: string;
  parentId?: number;
}

export default Factory.extend({
  id(i: number) {
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

  // @ts-expect-error type
  afterCreate(model: ModelInstance, server: Server) {
    function createChildComponent(
      parentId: number,
      baseId: number,
      index: number
    ) {
      const child = server.create('sbom-component', {
        id: String(baseId + faker.number.int(1000) + index),
        version: faker.system.semver(),
        bom_ref: `pkg:npm/${faker.lorem.slug()}@${faker.system.semver()}`,
        parentId,
      }) as SbomComponent;

      return child;
    }

    // Randomly decide if this component should have children (30% chance)
    if (faker.number.int(100) < 30) {
      // Create 1-3 child components
      const childCount = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < childCount; i++) {
        const child = createChildComponent(Number(model.id), 1000, i);

        // Randomly create grandchildren (20% chance)
        if (faker.number.int(100) < 20) {
          const grandchildCount = faker.number.int({ min: 1, max: 2 });

          for (let j = 0; j < grandchildCount; j++) {
            createChildComponent(Number(child.id), 2000, j);
          }
        }
      }
    }
  },
});
