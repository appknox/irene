import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  report_preference: () => ({
    show_pcidss: faker.datatype.boolean(),
    show_hipaa: faker.datatype.boolean(),
    show_gdpr: faker.datatype.boolean(),
    show_nist: faker.datatype.boolean(),
    show_sama: faker.datatype.boolean(),
  }),
});
