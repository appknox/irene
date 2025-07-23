import Model, { attr } from '@ember-data/model';

export default class ProfileVaNotifEmailModel extends Model {
  @attr('string')
  declare email: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'profile-va-notif-email': ProfileVaNotifEmailModel;
  }
}
