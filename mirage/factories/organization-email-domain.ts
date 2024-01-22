import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  domain_name: faker.internet.domainName,
});
