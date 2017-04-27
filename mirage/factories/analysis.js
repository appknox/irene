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
        title: faker.lorem.sentence(),
        description: "/var/mobile/Containers/Data/Application/A6564F42-72F2-4ADF-BCC3-A93BD0BC0D76/Library/Application Support/FlurryFiles/67490C75-A034-4435-A3F0-71D2BB637D81" //faker.lorem.sentence()
      });
    }
    return desc;
  }
});
