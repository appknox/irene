import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const GithubProjectComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  project: null,

  isChangingRepo: false,
  isDeletingGithub: false,

  githubRepos: ["Loading..."],

  tProjectRemoved: t("projectRemoved"),
  tRepoIntegrated: t("repoIntegrated"),
  tFetchGitHubRepoFailed: t("fetchGitHubRepoFailed"),

  confirmCallback() {
    const tProjectRemoved = this.get("tProjectRemoved");
    const projectId = this.get("project.id");
    const deleteGithub = [ENV.endpoints.deleteGHRepo, projectId].join('/');
    const that = this;
    this.set("isDeletingGithub", true);
    this.get("ajax").delete(deleteGithub)
    .then(function() {
      if(!that.isDestroyed) {
        that.set("isDeletingGithub", false);
        that.set("project.githubRepo", "");
      }
      that.get("notify").success(tProjectRemoved);
      that.send("closeDeleteGHConfirmBox");
    })
    .catch(function(error) {
      if(!that.isDestroyed) {
        that.set("isDeletingGithub", false);
        that.get("notify").error(error.payload.error);
      }
    });
  },

  fetchGithubRepos: (function() {
    if (ENV.environment === 'test') {
      // FIXME: Fix this test properly
      return;
    }
    const tFetchGitHubRepoFailed = this.get("tFetchGitHubRepoFailed");
    const that = this;
    this.get("ajax").request(ENV.endpoints.githubRepos)
    .then(function(data) {
      if(!that.isDestroyed) {
        that.set("githubRepos", data.repos);
      }
    })
    .catch(function() {
      if(!that.isDestroyed) {
        that.get("notify").error(tFetchGitHubRepoFailed);
      }
    });
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
      this.set("isChangingRepo", true);
      this.get("ajax").post(setGithub, {data})
      .then(function() {
        if(!that.isDestroyed) {
          that.set("isChangingRepo", false);
          that.set("project.githubRepo", repo);
        }
        that.get("notify").success(tRepoIntegrated);

      })
      .catch(function(error) {
        if(!that.isDestroyed) {
          that.set("isChangingRepo", false);
          that.get("notify").error(error.payload.error);
        }
      });
    },

    openDeleteGHConfirmBox() {
      this.set("showDeleteGHConfirmBox", true);
    },

    closeDeleteGHConfirmBox() {
      this.set("showDeleteGHConfirmBox", false);
    }
  }
});

export default GithubProjectComponent;
