import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  is_active: () => faker.datatype.boolean(),

  request: () => ({
    host: faker.internet.domainName(),
    method: faker.internet.httpMethod(),
    port: faker.internet.port(),
    path: `/${faker.lorem.slug()}`,
    scheme: faker.internet.protocol(),
  }),
});
