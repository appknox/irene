import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { t } from 'ember-intl';
import { task } from 'ember-concurrency';
import ENUMS from 'irene/enums';
import { on } from '@ember/object/evented';
import { computed } from '@ember/object';

const GithubProjectComponent = Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  project: null,

  thresholds: computed(function(){
    return ENUMS.THRESHOLD.CHOICES.filter(c => c.key !== 'UNKNOWN').map(c => c.value)
  }),
  selectedThreshold: ENUMS.THRESHOLD.LOW,
  githubRepos: null,

  organization: service(),
  tProjectRemoved: t("projectRemoved"),
  tRepoIntegrated: t("repoIntegrated"),
  tInvalidRepo: t("invalidProject"),
  tInvalidRisk: t("tInvalidRisk"),
  tFailedGitHubProject: t("failedGitHubProject"),
  currentGithubRepo: null,
  selectedRepo: null,

  hasGitHubProject: computed.gt('githubRepos.length', 0),

  deleteRepo: task(function *(){
    return yield this.get('currentGithubRepo').destroyRecord()
  }).evented(),

  deleteRepoErrored: on('deleteRepo:errored', function(_, err){
    this.get("notify").error(err.errors[0].detail);
    this.send("closeDeleteGHConfirmBox");
  }),

  deleteRepoSucceded: on('deleteRepo:succeeded', function(instance){
    let tProjectRemoved = this.get('tProjectRemoved')
    this.get('store')._removeFromIdMap(instance.value._internalModel)
    this.get("notify").success(tProjectRemoved);
    this.set("currentGithubRepo", null);
    this.send("closeDeleteGHConfirmBox");
    this.set('selectedRepo', null);
    this.set('selectedThreshold', 1);
  }),

  confirmCallback(){
    this.get('deleteRepo').perform();
  },

  setCurrentGithubRepo: task(function *(){
    return yield this.get("store").findRecord(
      'github-repo', this.get('project.id'));
  }).evented(),

  setCurrentGithubRepoErrored: on('setCurrentGithubRepo:errored', function(_, err){
    if (err.errors[0].detail && err.errors[0].detail==="Github not integrated"){
      this.set('currentGithubRepo', null)
      return
    }
    if(err.errors[0].detail && err.errors[0].detail==="Github integration failed"){
      this.set('reconnect', true);
      return
    }
    this.get("notify").error(this.get('tFailedGitHubProject'));
  }),

  setCurrentGithubRepoSucceeded: on('setCurrentGithubRepo:succeeded', function(instance){
    this.set('currentGithubRepo', instance.value)
    this.set('selectedRepo', instance.value.get('repo_details'));
  }),

  didInsertElement(){
    this.get('setCurrentGithubRepo').perform();
    this.get('fetchGithubRepos').perform();
  },

  getGithubRepos: task(function *(){
    let url = `/api/organizations/${this.get('organization.selected.id')}/github_repos`
    return yield this.get("ajax").request(url)
  }),

  fetchGithubRepos: task(function *(){
    try{
      let data = yield this.get('getGithubRepos').perform()
      this.set("githubRepos", data.results);
    }catch(error){
      if (error.status===400 && error.payload.detail==="Github integration failed"){
        this.set('reconnect', true);
        return
      }
      throw error
    }
  }).evented(),

  fetchGithubReposErrored: on('fetchGithubRepos:errored',function(_, error){
    if (error.status===404 && error.payload.detail==="Github not integrated"){
      this.set('githubRepos', null)
      return
    }
    this.get('notify').error(error.payload.detail)
  }),

  selectProject: task( function*() {
    let githubRepo = this.get('currentGithubRepo');
    const tRepoIntegrated = this.get("tRepoIntegrated");
    if (githubRepo){
      githubRepo.setProperties(
        {
          account: this.get('selectedRepo.owner.login'),
          repo: this.get('selectedRepo.name'),
          risk_threshold: this.get('selectedThreshold')
        }
      );
    }else{
      githubRepo = this.get('store').createRecord(
        'github-repo',{
          id: this.get('project.id'),
          account: this.get('selectedRepo.owner.login'),
          repo: this.get('selectedRepo.name'),
          risk_threshold: this.get('selectedThreshold'),
          project: this.get('project')
        }
      )
    }
    try{
      let currentGithubRepo = yield githubRepo.save()
      this.set("currentGithubRepo",currentGithubRepo);
      this.get("notify").success(tRepoIntegrated);
      yield this.set("showEditGithubModal", false )
    }catch(err){
      yield githubRepo.rollbackAttributes();
      yield this.get('store')._removeFromIdMap(githubRepo._internalModel);
      throw err;
    }
  }).evented(),

  selectProjectErrored: on('selectProject:errored', function(_, err){
    if (err.errors[0].source.pointer==="/data/attributes/account" &&
      err.errors[1].source.pointer==="/data/attributes/repo"){
        this.get("notify").error(this.get('tInvalidRepo'))
        return
      }
    if (err.errors[0].source.pointer==="/data/attributes/risk_threshold"){
      this.get("notify").error(this.get('tInvalidRisk'))
      return
    }
    if (err.errors[0].detail==="Github not integrated"){
      this.set("showEditGithubModal", false )
      this.set('githubRepos', null);
      this.set("currentGithubRepo", null);
    }
    this.get('notify').error(err.errors[0].detail)
  }),

  editGithubRepoModal: task(function *(){
    yield this.set("showEditGithubModal", true )
  }),

  closeGithubRepoModal: task(function *(){
    yield this.set("showEditGithubModal", false )
  }),

  selectRepo: task(function *(repo){
    yield this.set('selectedRepo', repo);
  }),

  selectThreshold: task(function *(threshold){
    yield this.set('selectedThreshold', threshold);
  }),

  actions: {
    openDeleteGHConfirmBox() {
      this.set("showDeleteGHConfirmBox", true);
    },

    closeDeleteGHConfirmBox() {
      this.set("showDeleteGHConfirmBox", false);
    }
  }
});

export default GithubProjectComponent;
