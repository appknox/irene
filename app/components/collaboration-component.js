import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const CollaborationComponentComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),

  project: null,
  selectedTeam: 0,
  isAddingCollaboration: false,
  tSelectAnyTeam: t("selectAnyTeam"),
  tCollaborationAdded: t("collaborationAdded"),

  collaborations: (function() {
    const projectId = this.get("project.id");
    return this.get("store").query("collaboration", {projectId});
  }).property("project.id", "realtime.CollaborationCounter"),

  teams: (function() {
    return this.get("store").findAll("team");
  }).property(),

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
      let that = this;
      const data = {
        projectId: this.get("project.id"),
        teamId: selectedTeam
      };
      that = this;
      this.set("isAddingCollaboration", true);
      this.get("ajax").post(ENV.endpoints.collaborations, {data})
      .then(function(){
        that.set("isAddingCollaboration", false);
        that.send("closeModal");
        that.get("notify").success(tCollaborationAdded);
      })
      .catch(function(error) {
        that.set("isAddingCollaboration", false);
        that.get("notify").error(error.payload.message, ENV.notifications);
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
