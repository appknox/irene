import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  // uuid: DS.attr 'string'
  // deviceToken: DS.attr 'string'
  version: faker.random.number,
  iconUrl: faker.internet.avatar,
  md5hash: faker.random.number,
  sha1hash: faker.random.number,
  name: faker.company.companyName,
  dynamicStatus: faker.random.arrayElement([0, 1, 2]),
  // analysis: DS.hasMany 'analysis', inverse: 'file'
  report: faker.internet.avatar,
  manual: faker.internet.boolean,

});
