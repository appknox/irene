import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const CollaborationComponentComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  project: null,
  selectedTeam: 0,
  isAddingCollaboration: false,
  tSelectAnyTeam: t("selectAnyTeam"),
  tCollaborationAdded: t("collaborationAdded"),

  orgTeams: (function() {
    const organizations = this.get("organizations");
    return this.get("store").query('organization-team', {id: organizations.content[0].id});
  }).property("organizations"),

  actions: {

    teamChanged() {
      this.set("selectedTeam", parseInt(this.$('#team-preference').val()));
    },

    addCollaboration() {
      const selectedTeam = this.get("selectedTeam");
      const tSelectAnyTeam = this.get("tSelectAnyTeam");
      const tCollaborationAdded = this.get("tCollaborationAdded");

      if (selectedTeam === 0) {
        return this.get("notify").error(tSelectAnyTeam);
      }
      const data = {
        projectId: this.get("project.id"),
        teamId: selectedTeam
      };
      this.set("isAddingCollaboration", true);
      this.get("ajax").post(ENV.endpoints.collaborations, {data})
      .then(() => {
        this.get("notify").success(tCollaborationAdded);
        if(!this.isDestroyed) {
          this.send("closeModal");
          this.set("isAddingCollaboration", false);
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isAddingCollaboration", false);
          this.get("notify").error(error.payload.message, ENV.notifications);
        }
      });
    },

    openCollaborationModal() {
      this.set("showCollaborationModal", true);
    },

    closeModal() {
      this.set("showCollaborationModal", false);
    }
  }
});


export default CollaborationComponentComponent;
