import faker from 'faker';
import Base from './base';

export default Base.extend({
  syncedOn: faker.date.past(),
});
