import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  automated_upload: faker.datatype.boolean(),
  monitoring_enabled: faker.datatype.boolean(),
  is_active: faker.datatype.boolean(),

  is_pending() {
    return !this.last_sync?.id;
  },

  has_latest_am_app_version() {
    return !!this.latest_am_app_version?.id;
  },

  is_not_found() {
    if (this.is_pending) {
      return false;
    }
    return !this.has_latest_am_app_version || false;
  },
});
