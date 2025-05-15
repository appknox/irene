/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error "trait" prop missing from miragejs
import { trait } from 'miragejs';
import { faker } from '@faker-js/faker';

import { ReportRequestStatus } from 'irene/models/ai-reporting/report-request';
import Base from '../base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  query() {
    return faker.lorem.sentence();
  },

  report_type() {
    return faker.helpers.arrayElement(['csv', 'xlsx']);
  },

  status() {
    return faker.helpers.arrayElement([
      ReportRequestStatus.PENDING,
      ReportRequestStatus.PROCESSING,
      ReportRequestStatus.COMPLETED,
      ReportRequestStatus.FAILED,
    ]);
  },

  error() {
    return faker.datatype.boolean();
  },

  error_message() {
    return faker.lorem.sentence();
  },

  withCompletedStatus: trait({
    status: ReportRequestStatus.COMPLETED,
  }),

  withPendingStatus: trait({
    status: faker.helpers.arrayElement([
      ReportRequestStatus.PENDING,
      ReportRequestStatus.PROCESSING,
    ]),
  }),

  withFailedStatus: trait({
    status: ReportRequestStatus.FAILED,
    error: true,
    error_message: faker.lorem.sentence(),
  }),
});
