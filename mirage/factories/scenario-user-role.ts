import Base from './base';
import { faker } from '@faker-js/faker';

export default Base.extend({
  name: () => faker.lorem.words(2),
});
