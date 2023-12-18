import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  meta_data: faker.lorem.sentence(),
  reason: faker.lorem.sentence(),
  package_name: faker.internet.domainName(),
  status_humanized: faker.lorem.sentence(3),
  url: () => faker.random.arrayElement([faker.internet.url, '']),

  status() {
    return faker.random.arrayElement(ENUMS.SUBMISSION_STATUS.VALUES);
  },

  source() {
    return faker.random.arrayElement(ENUMS.SUBMISSION_SOURCE.VALUES);
  },

  app_data: () => ({
    name: faker.company.companyName(),
    package_name: faker.internet.domainName(),
    icon_url: faker.internet.avatar(),
    platform: faker.random.arrayElement([
      ENUMS.PLATFORM.ANDROID,
      ENUMS.PLATFORM.IOS,
    ]),
  }),

  created_on: () => faker.date.recent().toString(),
});
