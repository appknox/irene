import { faker } from 'ember-cli-mirage';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({
  username: faker.name.firstName,
  role(){
    return faker.random.arrayElement(ENUMS.COLLABORATION_ROLE.VALUES);
  }
});
