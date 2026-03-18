/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error "trait" prop missing from miragejs
import { Factory, ModelInstance, Server, trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

function getEnumDisplay(
  enums: Array<{ value: string | number; key: string }>,
  value: number
) {
  return enums.find((c) => c.value === value)?.key;
}

export default Factory.extend({
  approved_on: () => faker.date.past(),
  added_on: () => faker.date.past(),
  updated_on: () => faker.date.recent(),
  rejected_on: () => faker.date.past(),
  last_fake_detection_on: () => faker.date.recent(),
  monitoring_enabled: () => faker.datatype.boolean(),
  monitoring_status: () => faker.number.int({ min: 0, max: 3 }),
  archived_on: () => faker.date.past(),
  unarchive_available_on: () => faker.date.future(),

  app_status: () => faker.helpers.arrayElement(ENUMS.SK_APP_STATUS.BASE_VALUES),

  approval_status: () =>
    faker.helpers.arrayElement(ENUMS.SK_APPROVAL_STATUS.BASE_VALUES),

  store_monitoring_status: () =>
    faker.helpers.arrayElement(ENUMS.SK_APP_MONITORING_STATUS.BASE_VALUES),

  fake_app_detection_status: () =>
    faker.helpers.arrayElement(ENUMS.SK_FAKE_APP_DETECTION_STATUS.BASE_VALUES),

  app_status_display() {
    const app_status = this.app_status as number;

    return getEnumDisplay(ENUMS.SK_APP_STATUS.BASE_CHOICES, app_status);
  },

  approval_status_display() {
    const approval_status = this.approval_status as number;

    return getEnumDisplay(
      ENUMS.SK_APPROVAL_STATUS.BASE_CHOICES,
      approval_status
    );
  },

  store_monitoring_status_display() {
    const store_monitoring_status = this.store_monitoring_status as number;

    return getEnumDisplay(
      ENUMS.SK_APP_MONITORING_STATUS.BASE_CHOICES,
      store_monitoring_status
    );
  },

  fake_app_detection_status_display() {
    const fake_app_detection_status = this.fake_app_detection_status as number;

    return getEnumDisplay(
      ENUMS.SK_FAKE_APP_DETECTION_STATUS.BASE_CHOICES,
      fake_app_detection_status
    );
  },

  // @ts-expect-error
  afterCreate(skApp: ModelInstance, server: Server) {
    // @ts-expect-error
    if (!skApp.app_metadata) {
      skApp.update({
        app_metadata: server.create('sk-app-metadata'),
      });
    }
  },

  withPendingReviewStatus: trait({
    approval_status: ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL,
    app_status: ENUMS.SK_APP_STATUS.ACTIVE,
  }),

  withApprovedStatus: trait({
    approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
    app_status: ENUMS.SK_APP_STATUS.ACTIVE,
  }),

  withDisabledStatus: trait({
    approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
    monitoring_enabled: false,
    store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
    fake_app_detection_status: ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
  }),

  withInitializingStatus: trait({
    approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
    app_status: ENUMS.SK_APP_STATUS.ACTIVE,
    monitoring_enabled: true,
    store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
    fake_app_detection_status: ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
  }),

  withArchivedStatus: trait({
    approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
    app_status: ENUMS.SK_APP_STATUS.ARCHIVED,
  }),

  withAddedToAppknox: trait({
    approval_status: ENUMS.SK_APPROVAL_STATUS.APPROVED,
    app_status: ENUMS.SK_APP_STATUS.ACTIVE,
  }),
});
