import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  id: (i) => i + 100 + 1,
  file: () => faker.number.int(),
  status: () => faker.number.int(),
  error_code: null,
  error_message: '',
  privacy_service_request_id: () => faker.string.uuid(),
  created_at: () => faker.date.recent().toISOString(),
  updated_at: () => faker.date.recent().toISOString(),
});
