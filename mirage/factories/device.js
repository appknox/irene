import { Factory, faker } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';

export default Factory.extend({
  version: faker.random.number,
  isTablet: faker.random.boolean,

  platform(){
    return faker.random.arrayElement(ENUMS.PLATFORM.VALUES);
  }

});
