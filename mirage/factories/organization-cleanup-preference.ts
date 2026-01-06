import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  is_enabled: () => faker.datatype.boolean(),
  files_to_keep: () => faker.number.int({ min: 2, max: 50 }),
  last_cleaned_at: () => faker.date.recent(),
});
