import { faker } from 'ember-cli-mirage';
import Base from './base';
import ENUMS from 'irene/enums';

export default Base.extend({
  role : function(){
    return faker.random.arrayElement(ENUMS.COLLABORATION_ROLE.VALUES);
  }
});
