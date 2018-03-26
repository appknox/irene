import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const TeamDetailsComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  team: null,
  identification: "",
  isInvitingMember: false,
  isSearchingMember: false,

  tEmptyEmailId: t("emptyEmailId"),
  tTeamMemberInvited: t("teamMemberInvited"),

  invitations: (function() {
    this.get("store").findAll("invitation");
  }).property(),

  searchMember() {
    this.set("isSearchingMember", true);
    const searchText = this.get("searchText");
    const searchQuery = `q=${searchText}`;
    const url = [ENV.endpoints.userSearch, searchQuery].join('?');
    const that = this;
    this.get("ajax").request(url)
    .then(function(response) {
      if(!that.isDestroyed) {
        that.set("isSearchingMember", false);
      }
      const allUsers = response.data;
      const allUsersData = allUsers.map((user) => ({
        username: user.attributes.username,
        email: user.attributes.email
      }));
      const users = that.set("users", allUsersData);
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
      Ember.run.debounce(this, this.searchMember, 500);
    },

    addMember() {
      const teamMember = this.get("teamMember");
      const tEmptyEmailId = this.get("tEmptyEmailId");
      const tTeamMemberAdded = this.get("tTeamMemberAdded");
      const tTeamMemberInvited = this.get("tTeamMemberInvited");
      const teamId = this.get("team.id");
      const url = [ENV.endpoints.teams, teamId, ENV.endpoints.members].join('/');
      for (let inputValue of [teamMember]) {
        if (isEmpty(inputValue)) { return this.get("notify").error(tEmptyEmailId); }
      }
      const data = {
        identification: identification,
        team_id: this.get("team.id")
      };
      this.set("isInvitingMember", true);
      this.get("ajax").post(url, {data})
      .then((data) => {
        if (__guard__(data != null ? data.data : undefined, x => x.type) === "team") {
          this.store.pushPayload(data);
          this.get("notify").success(tTeamMemberAdded);
        } else {
          this.get("notify").success(tTeamMemberInvited);
        }
        if(!this.isDestroyed) {
          this.set("isInvitingMember", false);
          this.set("teamMember", "");
          this.set("showAddMemberModal", false);
        }
      }, (error) => {
        this.set("isInvitingMember", false);
        this.get("notify").error(error.payload.message);
      });
    }
  }
});


export default TeamDetailsComponent;
