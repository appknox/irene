import Ember from 'ember';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  tagName: ["tr"],
  member: null,
  organization: null,
  tUserRoleUpdated: t("userRoleUpdated"),
  roles: ENUMS.ORGANIZATION_ROLES.CHOICES.slice(0, -1),

  selectMemberRole: task(function * () {
    const role = parseInt(this.$('#org-user-role').val());
    const member = this.get('member');
    member.set('role', role);
    yield member.save()
  }).evented(),
  selectMemberRoleSucceeded: on('selectMemberRole:succeeded', function() {
    this.get('notify').success(this.get('tUserRoleUpdated'));
  }),
  selectMemberRoleErrored: on('selectMemberRole:errored', function(_, error) {
    let errMsg = t('pleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message
    }
    this.get("notify").error(errMsg);
  }),
});
