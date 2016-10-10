import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  version: faker.random.number,
  iconUrl: faker.internet.avatar,
  md5hash: faker.random.number,
  sha1hash: faker.random.number,
  dynamicStatus: faker.random.arrayElement([0, 1, 2]),
  report: faker.internet.avatar,
  manual: faker.internet.boolean,

  name(){
    return faker.company.companyName();
  }
});
