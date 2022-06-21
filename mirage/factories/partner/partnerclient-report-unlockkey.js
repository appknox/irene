import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  unlockKey: faker.internet.password(),
});
