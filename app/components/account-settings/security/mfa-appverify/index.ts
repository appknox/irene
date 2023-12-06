import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';

// @ts-expect-error no types
import QRious from 'qrious';

interface AccountSettingsSecurityMfaAppverifySignature {
  Args: {
    secret: string;
    email: string;
    otp: string;
    onContinue: (otp: string) => void;
    onCancel: () => void;
    waiting: boolean;
  };
}

export default class AccountSettingsSecurityMfaAppverifyComponent extends Component<AccountSettingsSecurityMfaAppverifySignature> {
  @service declare intl: IntlService;

  @tracked qr = null;

  get qrURL() {
    const { email, secret } = this.args;

    return `otpauth://totp/Appknox:${email}?secret=${secret}&issuer=Appknox`;
  }

  @action
  onCanvasElementInsert(element: HTMLCanvasElement) {
    this.qr = new QRious({
      element,
      background: 'white',
      backgroundAlpha: 0.8,
      foreground: 'black',
      foregroundAlpha: 0.8,
      level: 'H',
      padding: 25,
      size: 300,
      value: this.qrURL,
    });
  }

  @action
  continue() {
    if (this.args.onContinue instanceof Function) {
      this.args.onContinue(this.args.otp);
    }
  }

  @action
  cancel() {
    if (this.args.onCancel instanceof Function) {
      this.args.onCancel();
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security::MfaAppverify': typeof AccountSettingsSecurityMfaAppverifyComponent;
  }
}
