import Model, { attr } from '@ember-data/model';

export default class NfInAppNotificationModel extends Model {
  @attr declare createdOn: Date;
  @attr declare hasRead: boolean;
  @attr declare messageCode: string;
  @attr declare context: unknown;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'nf-in-app-notification': NfInAppNotificationModel;
  }
}
