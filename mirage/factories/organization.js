import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  name: faker.company.companyName,
  owner: faker.name.firstName,
  users(){
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.name.firstName(2).split(" "));
    }
    return desc;
  }
});
