import { faker } from 'ember-cli-mirage';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({
  uuid: faker.random.number,
  deviceToken: faker.random.number,
  version: faker.random.number,
  iconUrl: faker.internet.avatar,
  md5hash: faker.random.number,
  sha1hash: faker.random.number,
  dynamicStatus:  function(){
    return faker.random.arrayElement(ENUMS.DYNAMIC_STATUS.VALUES);
  },
  report: faker.internet.avatar,
  manual: faker.internet.boolean,

  name(){
    return faker.company.companyName();
  }
});
