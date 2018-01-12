import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  companyName: faker.company.companyName,
  appName: faker.name.firstName,
  environment() {
    return faker.random.arrayElement(["Production", "Staging"]);
  },
  osVersion: faker.random.number,
  poc(){
    var item = [];
    for (var i = 0; i < 3; i++) {
      item.push({
        name: faker.name.firstName(),
        email: faker.internet.email()
      })
      return item;
    }
  }
});
