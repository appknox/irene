import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  companyName: faker.company.companyName,
  appName: faker.name.firstName,
  environment() {
    return faker.random.arrayElement(["production", "staging"]);
  },
  loginRequired: faker.random.boolean,
  vpnRequired: faker.random.boolean,
  osVersion: faker.random.number,
  appAction() {
    return faker.random.arrayElement(["proceed", "halt"]);
  },
  contact(){
    var item = {
      name: faker.name.firstName(),
      email: faker.internet.email()
    };
    return item;
  },
  vpnDetails(){
    var item = {
      address: faker.name.firstName(),
      port: faker.random.number()
    };
    var vpnRequired = faker.random.boolean;
    if(vpnRequired === true) {
      item = {
        address: faker.name.firstName(),
        port: faker.random.number(),
        username: faker.name.firstName(),
        password: faker.name.firstName()
      };
    }
    return item;
  },
  userRoles() {
    var item = [
      {
        "username": "yash",
        "password": "subham12345",
        "role": "admin"
      },
      {
        "username": "lino",
        "password": "test12",
        "role": "admin"
      },
      {
        "username": "yash",
        "password": "test1",
        "role": "customer"
      },
      {
        "username": "lino",
        "password": "test12",
        "role": "customer"
      }
    ];
    return item;
  }
});
