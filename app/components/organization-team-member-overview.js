import Ember from 'ember';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  team: null,
  tagName: ["tr"],
  isRemovingMember: false,
  showRemoveMemberPrompt: false,

  tEnterRightUserName: t("enterRightUserName"),
  tTeamMember: t("teamMember"),
  tTeamMemberRemoved: t("teamMemberRemoved"),


    // didReceiveAttrs() {
    //   this._super(...arguments);
    //   const id = this.get('member.id');
    //   // const orgMember = await this.get('store').find('organization-member', id);
    //   const m = this.get('member');
    //   // m.username = orgMember.username;
    //   // m.email = orgMember.email;
    //   const that = this;
    //   this.get('store').find('organization-member', id)
    //     .then(function (orgMember) {
    //       m.username = orgMember.username;
    //       m.email = orgMember.email;
    //     });
    // },

  /* Fetch member object */
  teamMember: (function() {
    const id = this.get('member.id');
    // const orgMember = await this.get('store').find('organization-member', id);
    const m = this.get('member');
    // m.username = orgMember.username;
    // m.email = orgMember.email;
    return this.get('store').find('organization-member', id)
    .then(function (orgMember) {
      m.username = orgMember.username;
      m.email = orgMember.email;
      return m;
    });
  }).property('member'),


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
    this.get('notify').success(`${this.get('team.name')} ${this.get('tTeamMemberRemoved')}`);

    this.set('showRemoveMemberPrompt', false);
    this.set('isRemovingMember', false);

    this.get('members').reload();
  }),

  removeMemberErrored: on('removeMember:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);

    this.set('showRemoveMemberPrompt', false);
    this.set('isRemovingMember', false);
  }),

  // promptCallback(promptedItem) {
  //   const tTeamMember = this.get("tTeamMember");
  //   const tTeamMemberRemoved = this.get("tTeamMemberRemoved");
  //   const tEnterRightUserName = this.get("tEnterRightUserName");
  //   const teamMember = this.get("member");
  //   if (promptedItem !== teamMember) {
  //     return this.get("notify").error(tEnterRightUserName);
  //   }
  //   const teamId = this.get("team.id");
  //   const orgId = this.get("team.organization.id");
  //   const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.teams, teamId, ENV.endpoints.members, teamMember].join('/');
  //   this.set("isRemovingMember", true);
  //   this.get("ajax").delete(url)
  //   .then((data) => {
  //     this.get("notify").success(`${tTeamMember} ${teamMember} ${tTeamMemberRemoved}`);
  //     if(!this.isDestroyed) {
  //       this.set("isRemovingMember", false);
  //       this.store.pushPayload(data);
  //     }
  //   }, (error) => {
  //     this.set("isRemovingMember", false);
  //     this.get("notify").error(error.payload.message);
  //   });
  // },


  actions: {
    confirmRemoveMemberProxy(inputValue) {
      this.get('removeMember').perform(inputValue)
    },
  }

});
