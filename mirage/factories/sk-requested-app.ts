/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error "trait" prop missing from miragejs
import { ModelInstance, Server, trait } from 'miragejs';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import SkAppFactory from './sk-app';

export default SkAppFactory.extend({
  withPendingApproval: trait({
    approved_by: null,
    approved_on: null,
    rejected_by: null,
    rejected_on: null,
    approval_status: ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL,
  }),

  withApproval: trait({
    approved_by: () => faker.person.firstName(),
    rejected_by: null,
    rejected_on: null,
    approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
  }),

  withRejection: trait({
    approved_by: null,
    approved_on: null,
    rejected_by: () => faker.person.firstName(),
    approval_status: ENUMS.SK_APPROVAL_STATUS.REJECTED,
  }),

  // @ts-expect-error
  afterCreate(skApp: ModelInstance, server: Server) {
    // @ts-expect-error
    if (!skApp.app_metadata) {
      skApp.update({
        app_metadata: server.create('sk-app-metadata'),
      });
    }
  },
});
