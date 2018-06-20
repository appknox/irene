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
    this.set("isDeletingGithub", true);
    this.get("ajax").delete(deleteGithub)
    .then(() => {
      this.get("notify").success(tProjectRemoved);
      if(!this.isDestroyed) {
        this.set("isDeletingGithub", false);
        this.set("project.githubRepo", "");
        this.send("closeDeleteGHConfirmBox");
      }    
    }, (error) => {
      if(!this.isDestroyed) {
        this.set("isDeletingGithub", false);
        this.get("notify").error(error.payload.error);
      }
    });
  },

  fetchGithubRepos: (function() {
    const tFetchGitHubRepoFailed = this.get("tFetchGitHubRepoFailed");
    this.get("ajax").request(ENV.endpoints.githubRepos)
    .then((data) => {
      if(!this.isDestroyed) {
        this.set("githubRepos", data.repos);
      }
    }, () => {
      if(!this.isDestroyed) {
        this.get("notify").error(tFetchGitHubRepoFailed);
      }
    });
  }).on("init"),

  actions: {

    selectRepo() {
      const repo = this.$('select').val();
      const tRepoIntegrated = this.get("tRepoIntegrated");
      const projectId = this.get("project.id");
      const setGithub = [ENV.endpoints.setGithub, projectId].join('/');
      const data =
        {repo};
      this.set("isChangingRepo", true);
      this.get("ajax").post(setGithub, {data})
      .then(() => {
        if(!this.isDestroyed) {
          this.set("isChangingRepo", false);
          this.set("project.githubRepo", repo);
        }
        this.get("notify").success(tRepoIntegrated);
      }, (error) => {
        this.set("isChangingRepo", false);
        this.get("notify").error(error.payload.error);
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
