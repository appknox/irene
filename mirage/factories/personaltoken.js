import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  key: faker.name.firstName,
  name: faker.name.firstName,
  created: faker.date.past
});
