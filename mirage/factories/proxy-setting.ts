import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  enabled() {
    return faker.datatype.boolean();
  },

  host() {
    return faker.internet.ip();
  },

  port() {
    return faker.helpers.arrayElement([1010, 2030, 8080, 5362, 1238]);
  },

  has_proxy_url() {
    const host = this.host as string;
    const port = this.port as number;

    return !!host && !!port;
  },
});
