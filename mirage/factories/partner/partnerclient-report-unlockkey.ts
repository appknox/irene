import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  unlockKey: faker.internet.password(),
});
