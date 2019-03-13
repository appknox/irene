import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const PersonaltokenDetailComponent = Component.extend({
  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  tagName: '',


  // revoke token

  isNotRevoked: true,
  isDeletingToken: false,
  tTokenRevoked: t('personalTokenRevoked'),

  confirmCallback() {
    const tTokenRevoked = this.get('tTokenRevoked');
    const personaltokenId = this.get('personaltoken.id');
    const url = [ENV.endpoints.personaltokens, personaltokenId].join('/');
    this.set("isDeletingToken", true);
    this.get('ajax').delete(url)
    .then(() => {
      if(!this.isDestroyed) {
        this.set('isNotRevoked', false);
        this.set("isDeletingToken", false);
        this.send('closeRevokePersonalTokenConfirmBox');
      }
      this.get('notify').success(tTokenRevoked);
    }, (error) => {
      if(!this.isDestroyed) {
        this.set("isDeletingToken", false);
        this.get("notify").error(error.payload.message);
      }
    });
  },

  actions: {
    openRevokePersonalTokenConfirmBox() {
      this.set('showRevokePersonalTokenConfirmBox', true);
    },

    closeRevokePersonalTokenConfirmBox() {
      this.set('showRevokePersonalTokenConfirmBox', false);
    }
  }
});


export default PersonaltokenDetailComponent;
