/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

export interface UserRole {
  id?: string | number;
  role: string;
  username: string;
  password: string;
}

export interface VpnDetails {
  address: string;
  port: number;
  username: string;
  password: string;
}

export interface Contact {
  name: string;
  email: string;
}

export default class ManualscanModel extends Model {
  @attr('string')
  declare appEnv: string;

  @attr('string')
  declare minOsVersion: string;

  @attr()
  declare contact: Contact;

  @attr('boolean')
  declare loginRequired: boolean;

  @attr()
  declare userRoles: UserRole[];

  @attr('boolean')
  declare vpnRequired: boolean;

  @attr()
  declare vpnDetails: VpnDetails;

  @attr('string')
  declare appAction: string;

  @attr('string')
  declare additionalComments: string;

  @computed('appEnv')
  get filteredAppEnv() {
    const appEnv = parseInt(this.appEnv);

    if (isNaN(appEnv)) {
      return ENUMS.APP_ENV.NO_PREFERENCE;
    }

    return appEnv;
  }

  @computed('appAction')
  get filteredAppAction() {
    const appAction = parseInt(this.appAction);

    if (isNaN(appAction)) {
      return ENUMS.APP_ACTION.NO_PREFERENCE;
    }

    return appAction;
  }

  @computed('appAction')
  get showProceedText() {
    return parseInt(this.appAction) === ENUMS.APP_ACTION.PROCEED;
  }

  @computed('appAction')
  get showHaltText() {
    return parseInt(this.appAction) === ENUMS.APP_ACTION.HALT;
  }

  @computed('loginRequired')
  get loginStatus() {
    if (this.loginRequired) {
      return 'yes';
    }

    return 'no';
  }

  @computed('vpnRequired')
  get vpnStatus() {
    if (this.vpnRequired) {
      return 'yes';
    }

    return 'no';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    manualscan: ManualscanModel;
  }
}
