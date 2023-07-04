import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

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
