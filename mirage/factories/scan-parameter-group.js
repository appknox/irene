import Base from './base';
import faker from 'faker';

export default Base.extend({
  name: faker.company.companyName(),
  description: faker.lorem.sentence(),
  is_active: () => faker.random.boolean(),
  is_default: () => faker.random.boolean(),
});
