import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  created_on: () => faker.date.recent().toISOString(),

  enabled() {
    return faker.datatype.boolean();
  },

  client_id() {
    return faker.string.uuid();
  },

  client_secret() {
    return faker.string.uuid();
  },

  discovery_url() {
    return `https://${faker.internet.domainName()}/.well-known/openid-configuration`;
  },
});
