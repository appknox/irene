// @ts-expect-error "trait" prop missing from miragejs
import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { OverrideRequestStatus } from 'irene/models/analysis-override-request';

// Mirage resolves attribute functions with sibling attrs already evaluated.
type ResolvedAttrs = { status: number; requested_status: number };

const STATUS_DISPLAY: Record<number, string> = {
  [OverrideRequestStatus.PENDING]: 'Pending',
  [OverrideRequestStatus.APPROVED]: 'Approved',
  [OverrideRequestStatus.REJECTED]: 'Rejected',
  [OverrideRequestStatus.COMPLETED]: 'Completed',
  [OverrideRequestStatus.OWNER_RESET]: 'Owner Reset',
};

const RISK_DISPLAY = {
  [ENUMS.RISK.NONE]: 'Passed',
  [ENUMS.RISK.LOW]: 'Low',
  [ENUMS.RISK.MEDIUM]: 'Medium',
  [ENUMS.RISK.HIGH]: 'High',
  [ENUMS.RISK.CRITICAL]: 'Critical',
};

const buildUser = () => ({
  id: faker.number.int({ min: 1, max: 100 }),
  username: faker.internet.userName(),
  email: faker.internet.email(),
});

export const ANALYSIS_OVERRIDE_REQUEST_FACTORY_DEF = {
  // The ember-data serializer declares `primaryKey = 'uuid'`.
  uuid: () => faker.string.uuid(),

  status: () =>
    faker.helpers.arrayElement([
      OverrideRequestStatus.PENDING,
      OverrideRequestStatus.APPROVED,
      OverrideRequestStatus.REJECTED,
      OverrideRequestStatus.COMPLETED,
      OverrideRequestStatus.OWNER_RESET,
    ]),

  status_display(this: ResolvedAttrs) {
    return STATUS_DISPLAY[this.status];
  },

  requested_status: () => faker.helpers.arrayElement(ENUMS.RISK.VALUES),

  requested_status_display(this: ResolvedAttrs) {
    return RISK_DISPLAY[this.requested_status];
  },

  comment: () => faker.lorem.sentence(),
  analysis_override_criteria: null,

  requested_by: () => buildUser(),

  reviewed_by(this: ResolvedAttrs) {
    return this.status === OverrideRequestStatus.APPROVED ? buildUser() : null;
  },

  created_on: () => faker.date.past().toISOString(),

  reviewed_on(this: ResolvedAttrs) {
    return this.status === OverrideRequestStatus.APPROVED
      ? faker.date.recent().toISOString()
      : null;
  },

  pending: trait({
    status: OverrideRequestStatus.PENDING,
  }),

  approved: trait({
    status: OverrideRequestStatus.APPROVED,
  }),
};

export default Factory.extend(ANALYSIS_OVERRIDE_REQUEST_FACTORY_DEF);
