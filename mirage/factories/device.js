/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  version: faker.random.number(),
  isTablet: faker.random.boolean(),

  platform(){
    return faker.random.arrayElement(ENUMS.PLATFORM.VALUES);
  }

});
