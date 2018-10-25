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

  didInsertElement() {
    window.test = this;
    this.get('checkJIRA').perform();
  },
  confirmCallback() {
    const tProjectRemoved = this.get("tProjectRemoved");
    const projectId = this.get("project.id");
    const deleteJIRA = [ENV.endpoints.deleteJIRAProject, projectId].join('/');
    this.get("ajax").delete(deleteJIRA)
    .then(() => {
      this.get("notify").success(tProjectRemoved);
      if(!this.isDestroyed) {
        this.send("closeDeleteJIRAConfirmBox");
        this.set("project.jiraProject", "");
      }
    }, (error) => {
      if(!this.isDestroyed) {
        this.get("notify").error(error.payload.error);
      }
    });
  },

  fetchJiraProjects: (function() {
    const tFetchJIRAProjectFailed = this.get("tFetchJIRAProjectFailed");
    this.get("ajax").request(ENV.endpoints.jiraProjects)
    .then((data) => {
      if(!this.isDestroyed) {
        this.set("jiraProjects", data.projects);
      }
    }, () => {
      this.get("notify").error(tFetchJIRAProjectFailed);
    });
  }).on("init"),

  actions: {

    selectProject() {
      const project= this.$('select').val();
      const tIntegratedJIRA = this.get("tIntegratedJIRA");
      const tRepoNotIntegrated = this.get("tRepoNotIntegrated");
      const projectId = this.get("project.id");
      const url = [ENV.endpoints.setJira, projectId].join('/');

      const data =
        {project};
      this.get("ajax").post(url, {data})
      .then(() => {
        this.get("notify").success(tIntegratedJIRA);
        if(!this.isDestroyed) {
          this.set("project.jiraProject", project);
        }
      }, () => {
        this.get("notify").error(tRepoNotIntegrated);
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
