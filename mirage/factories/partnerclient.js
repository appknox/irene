import {
  Factory
} from 'ember-cli-mirage';
import faker, {
  internet
} from 'faker';

export default Factory.extend({

  lastUploadedOn: faker.date.past(),
  logo: '',
  name: faker.company.companyName(),
  ownerEamils: [faker.internet.email(), faker, internet.email()],
  createdOn: faker.date.past()
});
