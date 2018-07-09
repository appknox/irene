import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  isTablet: faker.random.boolean,
  platformVersion: "2.3",
  platform: 1
});
