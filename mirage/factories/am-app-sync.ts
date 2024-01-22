import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  syncedOn: faker.date.past(),
});
