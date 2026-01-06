import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  is_high_risk_region: () => faker.datatype.boolean(),
  country_name: () => faker.location.country(),
  countryCode: () => faker.location.countryCode(),
  hostUrls: () => [
    {
      ip: faker.internet.ip(),
      cidr: `${faker.internet.ip()}/24`,
      domain: faker.internet.domainName(),
      source: faker.helpers.arrayElement(['0', '1']),
      source_location: [faker.lorem.sentence()],
    },
  ],
});
