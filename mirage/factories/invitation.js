import { Factory } from 'ember-cli-mirage';
import ENUMS from 'irene/enums';

export default Factory.extend({
  email: faker.internet.email,
  role(){
    return faker.random.arrayElement(ENUMS.COLLABORATION_ROLE.VALUES);
  }
});
