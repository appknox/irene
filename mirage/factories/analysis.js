import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  description: faker.lorem.sentence,
  analiserVersion: 1,
  risk: 1
});
