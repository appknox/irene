/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-component-lifecycle-hooks, ember/no-get, ember/no-observers, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import QRious from 'qrious';

export default Component.extend({
  intl: service(),
  secret: null,
  email: null,
  otp: "",
  waiting: false,
  onContinue: null,
  onCancel: null,
  qr: null,
  didInsertElement() {
this._super(...arguments);
    const canvas = this.element.querySelector('canvas');
    const qr = new QRious({
      element: canvas,
      background: 'white',
      backgroundAlpha: 0.8,
      foreground: 'black',
      foregroundAlpha: 0.8,
      level: 'H',
      padding: 25,
      size: 300,
      value: ""
    });
    this.set('qr', qr);
  },
  qrURL: computed('email', 'secret', function () {
    const email = this.get('email');
    const secret = this.get('secret');
    return `otpauth://totp/Appknox:${email}?secret=${secret}&issuer=Appknox`;
  }),
  qrURLChanged: observer('email', 'secret', function () {
    const qrURL = this.get('qrURL');
    const qr = this.get('qr');
    qr.value = qrURL;
  }),
  actions: {
    continue: function () {
      if (this.onContinue instanceof Function) {
        this.onContinue(this.get('otp'));
      }
    },
    cancel: function () {
      if (this.onCancel instanceof Function) {
        this.onCancel();
      }
    },
  }
});
