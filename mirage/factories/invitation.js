import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  email: faker.internet.email,
});
