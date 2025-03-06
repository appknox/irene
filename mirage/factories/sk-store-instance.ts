import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';

export default Factory.extend({
  created_on: () => faker.date.past(),

  country_code() {
    return faker.helpers.arrayElement(Object.keys(COUNTRY_NAMES_MAP));
  },
});
