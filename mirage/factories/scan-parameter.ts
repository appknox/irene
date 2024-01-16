import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  name: faker.company.name(),
  value: faker.lorem.slug(2),
  is_secure: () => faker.datatype.boolean(),
});
