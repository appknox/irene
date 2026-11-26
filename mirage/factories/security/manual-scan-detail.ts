import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  testers() {
    return [faker.person.fullName()];
  },

  reviewers() {
    return [faker.person.fullName()];
  },

  covered_scope() {
    return faker.lorem.sentences(2);
  },

  exempted_scope() {
    return faker.lorem.sentence();
  },

  covered_api_endpoints() {
    return ['/api/v1/login', '/api/v1/payments'];
  },

  exempted_api_endpoints() {
    return ['/api/v1/admin'];
  },
});
