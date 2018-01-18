import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  companyName: faker.company.companyName,
  appName: faker.name.firstName,
  environment() {
    return faker.random.arrayElement(["Production", "Staging"]);
  },
  loginRequired: faker.random.boolean,
  vpnRequired: faker.random.boolean,
  osVersion: faker.random.number,
  appAction() {
    return faker.random.arrayElement(["Proceed", "Halt"]);
  },
  poc(){
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
        "userRole": [
          {
            "id": 1,
            "role": "admin",
            "credentail": [
              {
                "username": "yash",
                "password": "test1"
              },
              {
                "username": "lino",
                "password": "test12"
              }
            ]
          }
        ],
      },
      {
        "userRole": [
          {
            "id": 2,
            "role": "customer",
            "credentail": [
              {
                "username": "nishaanth",
                "password": "test123"
              },
              {
                "username": "subham",
                "password": "test1234"
              }
            ]
          }
        ]
      }
    ];
    return item;
  }
});
