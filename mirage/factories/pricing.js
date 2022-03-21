/* eslint-disable prettier/prettier */
import faker from 'faker';
import Base from './base';

export default Base.extend({
  name: faker.name.firstName(),
  price: faker.commerce.price(),
  projectsLimit: faker.random.number(),

  description(){
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.lorem.words(2).split(" ").join(" -> "));
    }
    return desc.join(",");
  }
});
