import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const JiraProjectComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  project: null,
  jiraProjects: ["Loading..."],


  tIntegratedJIRA: t("integratedJIRA"),
  tProjectRemoved: t("projectRemoved"),
  tRepoNotIntegrated: t("repoNotIntegrated"),
  tFetchJIRAProjectFailed: t("fetchProjectFailed"),

  jira: (function() {
    return this.get("store").query('jira-integration', {id: this.get("project.activeProfileId")});
  }).property(),

  confirmCallback() {
    const tProjectRemoved = this.get("tProjectRemoved");
    const that = this;
    const projectId = this.get("project.id");
    const deleteJIRA = [ENV.endpoints.deleteJIRAProject, projectId].join('/');
    this.get("ajax").delete(deleteJIRA)
    .then(function() {
      that.get("notify").success(tProjectRemoved);
      if(!that.isDestroyed) {
        that.send("closeDeleteJIRAConfirmBox");
        that.set("project.jiraProject", "");
      }
    })
    .catch(function(error) {
      if(!that.isDestroyed) {
        that.get("notify").error(error.payload.error);
      }
    });
  },

  fetchJiraProjects: (function() {
    const tFetchJIRAProjectFailed = this.get("tFetchJIRAProjectFailed");
    const that = this;
    this.get("ajax").request(ENV.endpoints.jiraProjects)
    .then(data => that.set("jiraProjects", data.projects))
    .catch(function() {
      that.get("notify").error(tFetchJIRAProjectFailed);
    });
  }).on("init"),

  actions: {

    selectProject() {
      const project= this.$('select').val();
      const tIntegratedJIRA = this.get("tIntegratedJIRA");
      const tRepoNotIntegrated = this.get("tRepoNotIntegrated");
      const projectId = this.get("project.id");
      const url = [ENV.endpoints.setJira, projectId].join('/');
      const that = this;
      const data =
        {project};
      this.get("ajax").post(url, {data})
      .then(function() {
        that.get("notify").success(tIntegratedJIRA);
        that.set("project.jiraProject", project);})
      .catch(function() {
        that.get("notify").error(tRepoNotIntegrated);
      });
    },

    openDeleteJIRAConfirmBox() {
      this.set("showDeleteJIRAConfirmBox", true);
    },

    closeDeleteJIRAConfirmBox() {
      this.set("showDeleteJIRAConfirmBox", false);
    }
  }
});

export default JiraProjectComponent;
