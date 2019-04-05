import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { translationMacro as t } from 'ember-i18n';

export default Component.extend({
  me: service(),
  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),

  isSavingStatus: false,
  tChangedMandatoryMFA: t('changedMandatoryMFA'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  watchMandatoryMFA: observer('organization.mandatoryMfa', function(){
    this.get('setMandatoryMFA').perform();
  }),

  /* Set mandatory MFA value */
  setMandatoryMFA: task(function * () {
    this.set('isSavingStatus', true);
    const org = this.get('organization');
    yield org.set('mandatoryMfa', this.get('organization.mandatoryMfa'));
    yield org.save();
  }).evented(),

  setMandatoryMFASucceeded: on('setMandatoryMFA:succeeded', function() {
    this.set('isSavingStatus', false);
    this.get('notify').success(this.get('tChangedMandatoryMFA'));
  }),

  setMandatoryMFAErrored: on('setMandatoryMFA:errored', function(_, err) {
    this.set('isSavingStatus', false);
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
  }),
});
