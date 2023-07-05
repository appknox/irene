import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  app_env() {
    return faker.random.arrayElement(ENUMS.APP_ENV.VALUES);
  },

  login_required: faker.random.boolean(),
  vpn_required: faker.random.boolean(),
  additional_comments: faker.name.firstName(),
  min_os_version: faker.random.number,

  app_action() {
    return faker.random.arrayElement(ENUMS.APP_ACTION.VALUES);
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
