import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';
import { debounce } from '@ember/runloop';

const TeamDetailsComponent = Component.extend({

  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  showHide: true,
  editSave: false,
  identification: "",
  isAddingMember: false,
  organizationTeam: null,
  isInvitingMember: false,
  isSearchingMember: false,

  tEmptyEmailId: t("emptyEmailId"),
  tTeamMemberInvited: t("teamMemberInvited"),
  tOrganizationTeamNameUpdated: t("organizationTeamNameUpdated"),

  orgTeam: computed('organization.id', 'store', 'team.teamId', function() {
    const orgId = this.get("organization.id");
    const teamId = this.get("team.teamId");
    return this.get("store").queryRecord('organization-team', {orgId: orgId, teamId: teamId});
  }),

  teamMembers: computed('organization.id', 'store', 'team.teamId', function() {
    const orgId = this.get("organization.id");
    const teamId = this.get("team.teamId");
    return this.get("store").query('team-member', {orgId: orgId, teamId: teamId});
  }),

  teamProjects: computed('organization.id', 'store', 'team.teamId', function() {
    const orgId = this.get("organization.id");
    const teamId = this.get("team.teamId");
    return this.get("store").query('team-project', {orgId: orgId, teamId: teamId});
  }),

  searchMember() {
    const searchText = this.get("identification");
    const searchQuery = `q=${searchText}`;
    const url = [ENV.endpoints.userSearch, searchQuery].join('?');
    this.set("isSearchingMember", true);
    const that = this;
    this.get("ajax").request(url)
    .then(function(response) {
      if(!that.isDestroyed) {
        that.set("isSearchingMember", false);
      }
      const allUsers = response.data;
      const allUsersData = allUsers.map((user) => ({
        id: user.id,
        username: user.attributes.username,
        email: user.attributes.email
      }));
      that.set("users", allUsersData);
    })
    .catch(function(error) {
      that.set("isSearchingMember", false);
      that.get("notify").error(error.payload.message);
    });
  },

  actions: {

    openAddMemberModal() {
      this.set("showAddMemberModal", true);
    },

    searchQuery() {
      debounce(this, this.searchMember, 500);
    },

    addMember(userId) {
      const orgId = this.get("organization.id");
      const teamId = this.get("team.teamId");
      const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.teams, teamId, ENV.endpoints.members, userId].join("/");
      const that = this;
      this.set("isAddingMember", true);
      this.get("ajax").put(url)
      .then(function(data){
        that.get("notify").success("Team member added");
        if(!that.isDestroyed) {
          that.set("isAddingMember", false);
          that.set("identification", "");
          that.set("showAddMemberModal", false);
          that.store.pushPayload(data);
        }
      })
      .catch(function(error){
        that.set("isAddingMember", false);
        that.get("notify").error(error.payload.message);
      });
    },

    inviteMember() {
      const identification = this.get("identification");
      // const tTeamMemberInvited = this.get("tTeamMemberInvited");
      if(isEmpty(identification)) {
        const tEmptyEmailId = this.get("tEmptyEmailId");
        return this.get("notify").error(tEmptyEmailId);
      }
      // const data = {
      //   identification: identification,
      //   team_id: this.get("team.teamId")
      // };
      this.set("isInvitingMember", true);
      // this.get("ajax").post(url, {data});
      // .then((data) => {
      //   if (__guard__(data != null ? data.data : undefined, x => x.type) === "team") {
      //     this.store.pushPayload(data);
      //     this.get("notify").success(tTeamMemberAdded);
      //   } else {
      //     this.get("notify").success(tTeamMemberInvited);
      //   }
      //   if(!this.isDestroyed) {
      //     this.set("isInvitingMember", false);
      //     this.set("teamMember", "");
      //     this.set("showAddMemberModal", false);
      //   }
      // }, (error) => {
      //   this.set("isInvitingMember", false);
      //   this.get("notify").error(error.payload.message);
      // });
    },

    updateTeam() {
      const teamId = this.get("orgTeam.id");
      const orgTeamName = this.get("orgTeam.name");
      const orgId = this.get("orgTeam.organization.id");
      const tOrganizationTeamNameUpdated = this.get("tOrganizationTeamNameUpdated");
      const data = {
        name: orgTeamName
      };
      const url = [ENV.endpoints.organizations, orgId, ENV.endpoints.teams, teamId].join("/");
      const that = this;
      this.get("ajax").put(url, {data})
      .then(function() {
        that.get("notify").success(tOrganizationTeamNameUpdated);
        that.send("cancelEditing");
      })
      .catch(function(error) {
        that.get("notify").error(error.payload.message);
      });
    },

    editTeamName() {
      this.set('showHide', false);
      this.set('editSave', true);
    },

    cancelEditing() {
      this.set('showHide', true);
      this.set('editSave', false);
    }
  }
});


export default TeamDetailsComponent;
