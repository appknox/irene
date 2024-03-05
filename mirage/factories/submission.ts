import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export const SUBMISSION_FACTORY_DEF = {
  meta_data: faker.lorem.sentence(),
  reason: faker.lorem.sentence(),
  package_name: faker.internet.domainName(),
  status_humanized: faker.lorem.sentence(3),
  url: () => faker.helpers.arrayElement([faker.internet.url, '']),

  status() {
    return faker.helpers.arrayElement(ENUMS.SUBMISSION_STATUS.VALUES);
  },

  source() {
    return faker.helpers.arrayElement(ENUMS.SUBMISSION_SOURCE.VALUES);
  },

  app_data: () => ({
    name: faker.company.name(),
    package_name: faker.internet.domainName(),
    icon_url: faker.image.avatar(),
    platform: faker.helpers.arrayElement([
      ENUMS.PLATFORM.ANDROID,
      ENUMS.PLATFORM.IOS,
    ]),
  }),

  created_on: () => faker.date.recent().toString(),
};

export default Factory.extend(SUBMISSION_FACTORY_DEF);
