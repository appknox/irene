import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  name: faker.company.name(),

  report_preference: () => ({
    show_pcidss: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
    show_hipaa: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
    show_gdpr: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
  }),
});
