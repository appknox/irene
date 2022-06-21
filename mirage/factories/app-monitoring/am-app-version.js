import faker from 'faker';
import Base from '../base';

export default Base.extend({
  created_on: faker.date.past(),
  version: faker.random.number(),
  versionCode: faker.random.number(),
});
