import { faker } from 'ember-cli-mirage';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({
  analiserVersion: 1,

  risk(){
    return faker.random.arrayElement(ENUMS.RISK.VALUES);
  },
  status(){
    return faker.random.arrayElement(ENUMS.ANALYSIS.VALUES);
  },
  findings(){
    var desc = [];
    for (var i = 0; i < 3; i++) {
      desc.push({
        description: faker.lorem.sentence(),
        extra_description: faker.lorem.sentence()
      });
    }
    return desc;
  }
});
