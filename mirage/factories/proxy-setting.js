import faker from 'faker';
import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  enabled() {
    return faker.random.boolean();
  },

  host() {
    return faker.internet.ip();
  },

  port() {
    return faker.random.arrayElement([1010, 2030, 8080, 5362, 1238]);
  },

  has_proxy_url() {
    return !!this.host && !!this.port;
  },
});
