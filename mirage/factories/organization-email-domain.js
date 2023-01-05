import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  domain_name: faker.internet.domainName,
});
