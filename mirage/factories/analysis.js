import { faker } from 'ember-cli-mirage';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({
  description: faker.lorem.sentence,
  analiserVersion: 1,

  risk(){
    return faker.random.arrayElement(ENUMS.RISK.VALUES);
  },
  status(){
    return faker.random.arrayElement(ENUMS.ANALYSIS.VALUES);
  }
});
