import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';
import Base from './base';

export default Base.extend({
  roles: () =>
    faker.helpers.arrayElement(ENUMS.SK_ORGANIZATION_MEMBERSHIP_ROLES.VALUES),
});
