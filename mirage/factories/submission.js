import { Factory } from 'ember-cli-mirage';
import { faker } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';

export default Factory.extend({
  metaData: faker.lorem.sentence,
  reason: faker.lorem.sentence,
  packageName: faker.internet.domain,
  statusHumanized: faker.lorem.sentence,

  status(){
    return faker.random.arrayElement(ENUMS.SUBMISSION_STATUS.VALUES);
  },
  source(){
    return faker.random.arrayElement(ENUMS.SUBMISSION_SOURCE.VALUES);
  }
});
