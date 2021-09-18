import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  name: faker.company.companyName(),
  reportPreference: {
    show_pcidss: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
    show_hipaa: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
    show_asvs: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
    show_mstg: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
    show_cwe: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
    show_gdpr: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
  },
});
