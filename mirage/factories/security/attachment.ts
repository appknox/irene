import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  uuid: () => faker.string.uuid(),
  name: () => faker.system.fileName(),
  created_on: () => faker.date.past().toISOString(),
});
