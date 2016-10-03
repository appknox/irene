import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  id (i) {
    return i;
  },
  createdOn: faker.date.past,
  updatedOn: faker.date.past
  // createdBy: an ID of a user
});
