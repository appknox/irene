import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  is_trial: () => faker.datatype.boolean(),
  end_date: () => faker.date.recent().toISOString(),
  licenses_procured: () => faker.number.int({ min: 1 }),
  licenses_remaining: () => faker.number.int(),
  is_active: () => faker.datatype.boolean(),
  is_license_tracking_applicable: () => faker.datatype.boolean(),
  updated_by: () => faker.person.firstName(),
  created_by: () => faker.person.firstName(),
});
