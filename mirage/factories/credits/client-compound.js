import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';
export default Factory.extend({
  utilized() {
    return faker.random.number({
      min: 1,
      max: 10
    })
  },
  availabel() {
    return faker.random.number({
      min: 100,
      max: 200
    })
  },
  earned() {
    return faker.random.number({
      min: 200,
      max: 300
    })
  }
});
