/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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

    return this.get('ajax').delete(url)
    .then(data => that.set('isNotRevoked', false)).then(function(data) {
      that.get('notify').success(tTokenRevoked);
      return that.send('closeRevokePersonalTokenConfirmBox');}).catch(error =>
      (() => {
        const result = [];
        for (error of Array.from(error.payload.errors)) {
          result.push(that.get('notify').error(error.detail));
        }
        return result;
      })()
    );
  },

  actions: {
    openRevokePersonalTokenConfirmBox() {
      return this.set('showRevokePersonalTokenConfirmBox', true);
    },

    closeRevokePersonalTokenConfirmBox() {
      return this.set('showRevokePersonalTokenConfirmBox', false);
    }
  }
});


export default PersonaltokenDetailComponent;
