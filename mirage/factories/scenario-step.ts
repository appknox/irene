import Base from './base';
import { faker } from '@faker-js/faker';
import { ScenarioStepAction } from 'irene/models/scenario-step';

export default Base.extend({
  order: () => faker.number.int({ min: 1, max: 20 }),
  action: ScenarioStepAction.TAP,
  identifier: () => faker.lorem.word(),
  value: () => faker.lorem.word(),
  is_secure: () => faker.datatype.boolean(),
});
