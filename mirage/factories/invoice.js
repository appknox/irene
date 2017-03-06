import { Factory, faker } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';

export default Factory.extend({
  amount: faker.commerce.price,
  paidOn: faker.date.past,

  source(){
    return faker.random.arrayElement(ENUMS.PAYMENT_SOURCE.VALUES);
  },
  duration(){
    return faker.random.arrayElement(ENUMS.PAYMENT_DURATION.VALUES);
  }
});
