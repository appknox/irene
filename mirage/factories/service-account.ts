import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  id: (i) => i + 1,

  scope_public_api_user_read: faker.datatype.boolean(),
  scope_public_api_project_read: faker.datatype.boolean(),
  scope_public_api_scan_result_va: faker.datatype.boolean(),
  scope_auto_approve_new_name_spaces: faker.datatype.boolean(),
  scope_public_api_upload_app: faker.datatype.boolean(),
  scope_public_api_team_operations: faker.datatype.boolean(),
  scope_public_api_user_write: faker.datatype.boolean(),
  is_expired: false,
  secret_access_key: 'ak_sa_***************',

  created_by_user: (i) => i + 1,
  expiry: () => faker.date.anytime().toString(),
  access_key_id: () => faker.string.alphanumeric(16),
  description: faker.lorem.sentence(),
  name: faker.company.name(),
  updated_on: () => faker.date.anytime().toString(),
  created_on: () => faker.date.anytime().toString(),
  is_active: () => faker.datatype.boolean(),
  updated_by_user: (i) => i + 1,
  service_account_type: () => faker.helpers.arrayElement([1, 2]),
  all_projects: true,

  projects() {
    const id = this.id as number;

    return `/api/service_accounts/${id}/projects`;
  },
});
