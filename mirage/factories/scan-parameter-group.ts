import Base from './base';
import { faker } from '@faker-js/faker';

export default Base.extend({
  name: faker.company.name(),
  description: faker.lorem.sentence(),
  is_active: () => faker.datatype.boolean(),
  is_default: () => faker.datatype.boolean(),
});
