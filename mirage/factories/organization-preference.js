/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  reportPreference: {
    show_pcidss: faker.datatype.boolean(),
    show_hipaa: faker.datatype.boolean(),
    show_gdpr: faker.datatype.boolean(),
  },
});
