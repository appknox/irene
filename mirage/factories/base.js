import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  id (i) {
    return i+1;
  },
  createdOn: faker.date.past,
  updatedOn: faker.date.past
  // createdBy: an ID of a user
});
