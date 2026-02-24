import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  version() {
    return faker.number.int({ min: 1, max: 100 });
  },

  customCountries() {
    return faker.helpers.arrayElements(
      ['IN', 'US', 'UK', 'SG', 'AU'],
      faker.number.int({ min: 1, max: 5 })
    );
  },

  geoSettings() {
    const geoTypes = ['geo_cu', 'geo_by', 'geo_ve'];

    return faker.helpers
      .arrayElements(geoTypes, faker.number.int({ min: 1, max: 2 }))
      .map((type) => ({
        value: faker.datatype.boolean(),
        settings_parameter: type,
      }));
  },
});
