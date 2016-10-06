import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  project : faker.company.companyName,
  user : faker.internet.avatar,
  role : faker.name.title
});
