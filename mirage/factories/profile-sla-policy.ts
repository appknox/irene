import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';

const slaWindow = () => ({
  remediation_time: faker.number.int({ min: 1, max: 365 }),
  remediation_time_type: ENUMS.SLA_REMEDIATION_TIME_TYPE.DAY,
  is_inherited: true,
});

export default Factory.extend({
  critical: slaWindow,
  high: slaWindow,
  medium: slaWindow,
  low: slaWindow,
});
