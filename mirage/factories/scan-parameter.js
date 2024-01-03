import faker from 'faker';
import Base from './base';

export default Base.extend({
  name: faker.company.companyName(),
  value: faker.lorem.slug(2),
  is_secure: () => faker.random.boolean(),
});
