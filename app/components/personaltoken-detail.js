import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const PersonaltokenDetailComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  tagName: '',


  // revoke token

  isNotRevoked: true,
  tTokenRevoked: t('personalTokenRevoked'),

  confirmCallback() {
    const tTokenRevoked = this.get('tTokenRevoked');
    const personaltoken = this.get('personaltoken');
    const personaltokenId = this.get('personaltoken.id');

    const that = this;
    const url = [ENV.endpoints.personaltokens, personaltokenId].join('/');

    this.get('ajax').delete(url)
    .then(data => that.set('isNotRevoked', false))
    .then(function(data) {
      that.get('notify').success(tTokenRevoked);
      that.send('closeRevokePersonalTokenConfirmBox');
    })
    .catch(function(error) {
      that.get("notify").error(error.payload.message);
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
