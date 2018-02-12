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

const GithubProjectComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  project: null,
  githubRepos: ["Loading..."],

  tProjectRemoved: t("projectRemoved"),
  tRepoIntegrated: t("repoIntegrated"),
  tFetchGitHubRepoFailed: t("fetchGitHubRepoFailed"),

  confirmCallback() {
    const tProjectRemoved = this.get("tProjectRemoved");
    const projectId = this.get("project.id");
    const deleteGithub = [ENV.endpoints.deleteGHRepo, projectId].join('/');
    const that = this;
    return this.get("ajax").delete(deleteGithub)
    .then(function(data) {
      that.get("notify").success(tProjectRemoved);
      that.send("closeDeleteGHConfirmBox");
      return that.set("project.githubRepo", "");}).catch(error =>
      (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })()
    );
  },

  fetchGithubRepos: (function() {
    if (ENV.environment === 'test') {
      // FIXME: Fix this test properly
      return;
    }
    const tFetchGitHubRepoFailed = this.get("tFetchGitHubRepoFailed");
    const that = this;
    return this.get("ajax").request(ENV.endpoints.githubRepos)
    .then(data => that.set("githubRepos", data.repos)).catch(function(error) {
      that.get("notify").error(tFetchGitHubRepoFailed);
      return (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })();});

  }).on("init"),

  actions: {

    selectRepo() {
      const repo = this.$('select').val();
      const tRepoIntegrated = this.get("tRepoIntegrated");
      const projectId = this.get("project.id");
      const setGithub = [ENV.endpoints.setGithub, projectId].join('/');
      const that = this;
      const data =
        {repo};
      return this.get("ajax").post(setGithub, {data})
      .then(function(data) {
        that.get("notify").success(tRepoIntegrated);
        return that.set("project.githubRepo", repo);}).catch(error =>
        (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })()
      );
    },

    openDeleteGHConfirmBox() {
      return this.set("showDeleteGHConfirmBox", true);
    },

    closeDeleteGHConfirmBox() {
      return this.set("showDeleteGHConfirmBox", false);
    }
  }
});

export default GithubProjectComponent;
