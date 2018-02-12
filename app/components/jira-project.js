/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const JiraProjectComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  project: null,
  jiraProjects: ["Loading..."],


  tRepoIntegrated: t("repoIntegrated"),
  tProjectRemoved: t("projectRemoved"),
  tRepoNotIntegrated: t("repoNotIntegrated"),
  tFetchJIRAProjectFailed: t("fetchProjectFailed"),

  confirmCallback() {
    const tProjectRemoved = this.get("tProjectRemoved");
    const that = this;
    const projectId = this.get("project.id");
    const deleteJIRA = [ENV.endpoints.deleteJIRAProject, projectId].join('/');
    return this.get("ajax").delete(deleteJIRA)
    .then(function(data) {
      that.get("notify").success(tProjectRemoved);
      that.send("closeDeleteJIRAConfirmBox");
      return that.set("project.jiraProject", "");}).catch(error =>
      (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })()
    );
  },

  fetchJiraProjects: (function() {
    if (ENV.environment === 'test') {
      // FIXME: Fix this test properly
      return;
    }
    const tFetchJIRAProjectFailed = this.get("tFetchJIRAProjectFailed");
    const that = this;
    return this.get("ajax").request(ENV.endpoints.jiraProjects)
    .then(data => that.set("jiraProjects", data.projects)).catch(function(error) {
      that.get("notify").error(tFetchJIRAProjectFailed);
      return (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })();});

  }).on("init"),

  actions: {

    selectProject() {
      const project= this.$('select').val();
      const tRepoIntegrated = this.get("tRepoIntegrated");
      const tRepoNotIntegrated = this.get("tRepoNotIntegrated");
      const projectId = this.get("project.id");
      const url = [ENV.endpoints.setJira, projectId].join('/');
      const that = this;
      const data =
        {project};
      return this.get("ajax").post(url, {data})
      .then(function(data) {
        that.get("notify").success(tRepoIntegrated);
        return that.set("project.jiraProject", project);}).catch(function(error) {
        that.get("notify").error(tRepoNotIntegrated);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    },

    openDeleteJIRAConfirmBox() {
      return this.set("showDeleteJIRAConfirmBox", true);
    },

    closeDeleteJIRAConfirmBox() {
      return this.set("showDeleteJIRAConfirmBox", false);
    }
  }
});

export default JiraProjectComponent;
