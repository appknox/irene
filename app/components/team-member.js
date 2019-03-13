import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const TeamMemberComponent = Component.extend({
  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  organizationTeam: null,
  tagName: ["tr"],

  isRemovingMember: false,

  tEnterRightUserName: t("enterRightUserName"),
  tTeamMember: t("teamMember"),
  tTeamMemberRemoved: t("teamMemberRemoved"),

  promptCallback(promptedItem) {
    const tTeamMember = this.get("tTeamMember");
    const tTeamMemberRemoved = this.get("tTeamMemberRemoved");
    const tEnterRightUserName = this.get("tEnterRightUserName");
    const teamMember = this.get("member");
    if (promptedItem !== teamMember) {
      return this.get("notify").error(tEnterRightUserName);
    }
    const teamId = this.get("organizationTeam.id");
    const orgId = this.get("organizationTeam.organization.id");
    const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.teams, teamId, ENV.endpoints.members, teamMember].join('/');
    this.set("isRemovingMember", true);
    this.get("ajax").delete(url)
    .then((data) => {
      this.get("notify").success(`${tTeamMember} ${teamMember} ${tTeamMemberRemoved}`);
      if(!this.isDestroyed) {
        this.set("isRemovingMember", false);
        this.store.pushPayload(data);
      }
    }, (error) => {
      this.set("isRemovingMember", false);
      this.get("notify").error(error.payload.message);
    });
  },

  actions: {

    openRemoveMemberPrompt() {
      this.set("showRemoveMemberPrompt", true);
    },

    closeRemoveMemberPrompt() {
      this.set("showRemoveMemberPrompt", false);
    }
  }
});


export default TeamMemberComponent;
