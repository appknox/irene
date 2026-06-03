import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

const KNOXIQ_SCAN_STATUS_VALUES = ENUMS.KNOXIQ_SCAN_STATUS.BASE_VALUES.filter(
  (status) => status !== ENUMS.KNOXIQ_SCAN_STATUS.LEGACY
);

export const KNOXIQ_SCAN_FACTORY_DEF = {
  sast_status() {
    return faker.helpers.arrayElement(KNOXIQ_SCAN_STATUS_VALUES);
  },

  dast_status() {
    return faker.helpers.arrayElement(KNOXIQ_SCAN_STATUS_VALUES);
  },
};

export default Factory.extend(KNOXIQ_SCAN_FACTORY_DEF);
