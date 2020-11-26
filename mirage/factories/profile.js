import faker from 'faker';
import Base from './base';

export default Base.extend({
  afterCreate(profile, server) {
    server.create('file', {
      profile
    });
  },
  showUnknownAnalysis: faker.random.boolean()
});
