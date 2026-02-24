import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  maskPii() {
    return faker.datatype.boolean();
  },

  customRegex() {
    return Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(
      () => `regex_${faker.string.alphanumeric(8)}`
    );
  },

  version() {
    return faker.number.int({ min: 1, max: 100 });
  },

  piiSettings() {
    const piiTypes = ['pii_email', 'pii_phone', 'pii_person', 'pii_location'];

    return faker.helpers
      .arrayElements(piiTypes, faker.number.int({ min: 2, max: 3 }))
      .map((type) => ({
        value: faker.datatype.boolean(),
        settings_parameter: type,
      }));
  },
});
