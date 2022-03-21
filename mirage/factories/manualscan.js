/* eslint-disable prettier/prettier */
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  appEnv() {
    return faker.random.arrayElement(ENUMS.APP_ENV.VALUES);
  },
  loginRequired: faker.random.boolean(),
  vpnRequired: faker.random.boolean(),
  additionalComments: faker.name.firstName(),
  minOsVersion: faker.random.number,
  appAction() {
    return faker.random.arrayElement(ENUMS.APP_ACTION.VALUES);
  },
  contact(){
    var item = {
      name: "",
      email: ""
    };
    return item;
  },
  vpnDetails(){
    var item = {
        address: "",
        port: "",
        username: "",
        password: ""
      };
    return item;
  },
  userRoles() {
    var item = [];
    return item;
  }
});
