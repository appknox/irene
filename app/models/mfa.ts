import Model, { attr } from '@ember-data/model';
import ENUMS from 'irene/enums';

const MFA_METHODS = {
  [ENUMS.MFA_METHOD.TOTP]: 'Authenticator App',
  [ENUMS.MFA_METHOD.HOTP]: 'Email',
};

type MfaMethodKey = keyof typeof MFA_METHODS;

export default class MfaModel extends Model {
  @attr('string')
  declare method: string;

  @attr('boolean')
  declare enabled: boolean;

  get display() {
    return MFA_METHODS[parseInt(this.method) as MfaMethodKey] || '';
  }

  get isEmail() {
    return parseInt(this.method) === ENUMS.MFA_METHOD.HOTP;
  }

  get isApp() {
    return parseInt(this.method) === ENUMS.MFA_METHOD.TOTP;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    mfa: MfaModel;
  }
}
