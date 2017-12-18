import { Factory } from 'ember-cli-mirage';
import { faker } from 'ember-cli-mirage';

export default Factory.extend({

  totalCritical: faker.random.number,
  totalHigh: faker.random.number,
  totalMedium: faker.random.number,
  totalLow: faker.random.number

});
