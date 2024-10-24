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

  ds_automated_platform_version_min: () => faker.string.numeric(1),
  ds_automated_sim_required: faker.datatype.boolean(),
  ds_automated_vpn_required: faker.datatype.boolean(),
  ds_automated_pin_lock_required: faker.datatype.boolean(),
});
