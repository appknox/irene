import faker from 'faker';
import Base from './base';

export default Base.extend({
  automatedUpload: faker.random.boolean(),
  monitoringEnabled: faker.random.boolean(),

  isPending() {
    return !this.lastSync?.id;
  },

  hasLatestAmAppVersion() {
    return !!this.latestAmAppVersion?.id;
  },

  isNotFound() {
    if (this.isPending) {
      return false;
    }
    return !this.hasLatestAmAppVersion || false;
  },
});
