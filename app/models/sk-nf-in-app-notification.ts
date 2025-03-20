import NfInAppNotificationModel from './nf-in-app-notification';

export default class SkNfInAppNotificationModel extends NfInAppNotificationModel {}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-nf-in-app-notification': SkNfInAppNotificationModel;
  }
}
