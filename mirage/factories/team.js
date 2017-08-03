import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  name: faker.company.companyName,
  membersCount: faker.random.number,
  projectsCount: faker.random.number,
  members(){
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.name.firstName(2).split(" "));
    }
    return desc.join(",");
  }
});
