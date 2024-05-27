import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  package_name() {
    return faker.internet.domainName();
  },

  is_manual_scan_available() {
    return faker.datatype.boolean();
  },
});
