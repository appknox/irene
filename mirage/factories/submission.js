import { Factory } from 'ember-cli-mirage';
import { faker } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';

export default Factory.extend({
  metaData: faker.lorem.sentence,
  status: function(){
    return faker.random.arrayElement(ENUMS.SUBMISSION_STATUS.VALUES);
  },
  reason: faker.lorem.sentence,
  source: function(){
    return faker.random.arrayElement(ENUMS.SUBMISSION_SOURCE.VALUES);
  },
  packageName: faker.internet.domain
});
