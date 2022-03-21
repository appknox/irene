/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
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
    show_gdpr: {
      value: faker.datatype.boolean(),
      is_inherited: faker.datatype.boolean(),
    },
  },
});
