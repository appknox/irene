// @ts-expect-error "trait" prop missing from miragejs
import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';
import { OverrideRequestStatus } from 'irene/models/analysis-override-request';

export const ANALYSIS_FACTORY_DEF = {
  overridden_risk: faker.helpers.arrayElement([null, 1, 2, 3, 4]),
  status: faker.helpers.arrayElement(ENUMS.ANALYSIS.VALUES),
  created_on: faker.date.past(),
  updated_on: faker.date.past(),

  // No override request unless a trait asks for one.
  override_request_status: null,
  override_requested_risk: null,

  risk() {
    return faker.helpers.arrayElement(ENUMS.RISK.VALUES);
  },

  computed_risk() {
    return faker.helpers.arrayElement(ENUMS.RISK.VALUES);
  },

  withPendingOverrideRequest: trait({
    override_request_status: OverrideRequestStatus.PENDING,
    override_requested_risk: () =>
      faker.helpers.arrayElement(ENUMS.RISK.VALUES),
  }),

  withApprovedOverrideRequest: trait({
    override_request_status: OverrideRequestStatus.APPROVED,
    override_requested_risk: () =>
      faker.helpers.arrayElement(ENUMS.RISK.VALUES),
  }),
};

export default Factory.extend(ANALYSIS_FACTORY_DEF);
