import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  permission_name: () => faker.company.name(),
  category: () => faker.lorem.word(),
  created_at: () => faker.date.past().toISOString(),
  updated_at: () => faker.date.recent().toISOString(),
});
