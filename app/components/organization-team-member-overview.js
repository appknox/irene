import Ember from 'ember';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  realtime: Ember.inject.service(),
  me: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  team: null,
  tagName: ["tr"],
  isRemovingMember: false,
  showRemoveMemberPrompt: false,

  tEnterRightUserName: t("enterRightUserName"),
  tTeamMember: t("teamMember"),
  tTeamMemberRemoved: t("teamMemberRemoved"),


  /* Open remove-member prompt */
  openRemoveMemberPrompt: task(function * () {
    yield this.set("showRemoveMemberPrompt", true);
  }),


  /* Remove member */
  removeMember: task(function * (inputValue) {
    this.set('isRemovingMember', true);

    const memberName = this.get('member.user.username').toLowerCase();
    const promptedMember = inputValue.toLowerCase();
    if (promptedMember !== memberName) {
      throw new Error(this.get('tEnterRightUserName'));
    }

    const t = this.get('team');
    let m = this.get('member');
    yield t.deleteMember(m);

  }).evented(),

  removeMemberSucceeded: on('removeMember:succeeded', function() {
    this.get('notify').success(this.get('tTeamMemberRemoved'));

    this.set('showRemoveMemberPrompt', false);
    this.set('isRemovingMember', false);

    this.get('realtime').incrementProperty('OrganizationNonTeamMemberCounter');
  }),

  removeMemberErrored: on('removeMember:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
    this.set('isRemovingMember', false);
  }),


  actions: {
    confirmRemoveMemberProxy(inputValue) {
      this.get('removeMember').perform(inputValue)
    },
  }

});
