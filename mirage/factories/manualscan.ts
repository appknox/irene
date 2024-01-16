import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  app_env() {
    return faker.helpers.arrayElement(ENUMS.APP_ENV.VALUES);
  },

  login_required: faker.datatype.boolean(),
  vpn_required: faker.datatype.boolean(),
  additional_comments: faker.person.firstName(),
  min_os_version: faker.number.int(),

  app_action() {
    return faker.helpers.arrayElement(ENUMS.APP_ACTION.VALUES);
  },

  contact() {
    return {
      name: '',
      email: '',
    };
  },

  vpn_details() {
    return {
      address: '',
      port: '',
      username: '',
      password: '',
    };
  },

  user_roles() {
    return [];
  },
});
