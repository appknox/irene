import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import ENUMS from 'irene/enums';

const GithubProjectComponent = Component.extend({
  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  project: null,

  isChangingRepo: false,
  thresholds: ENUMS.THRESHOLD.CHOICES.filter(c => c.key !== 'UNKNOWN').map(c => c.value),
  selectedThreshold: ENUMS.THRESHOLD.LOW,
  githubRepos: [],

  organization: service(),
  tProjectRemoved: t("projectRemoved"),
  tRepoIntegrated: t("repoIntegrated"),
  tInvalidRepo: t("invalidProject"),
  tInvalidRisk: t("tInvalidRisk"),
  tFailedGitHubProject: t("failedGitHubProject"),
  currentGithubRepo: null,
  selectedRepo: null,

  deleteRepo: task(function *(){
    let tProjectRemoved = this.get('tProjectRemoved')
    return yield this.get('currentGithubRepo').destroyRecord()
    .then((data)=>{
      this.get('store')._removeFromIdMap(data._internalModel)
      this.get("notify").success(tProjectRemoved);
      this.set("currentGithubRepo", null);
      this.send("closeDeleteGHConfirmBox");
      this.set('selectedRepo', null);
      this.set('selectedThreshold', 1);
    }, (error)=>{
      this.get("notify").error(error.payload.error);
      }
    )
  }),
  confirmCallback(){
    this.get('deleteRepo').perform();
  },

  setCurrentGithubRepo: task(function *(){
    try{
      let currentGithubRepo = yield this.get("store").findRecord(
        'github-repo', this.get('project.id'));
      this.set('currentGithubRepo', currentGithubRepo)
      this.set('selectedRepo', currentGithubRepo.get('repo_details'));
    }catch(err){
      const status = err.errors[0].status
      if (status==="404" && err.errors[0].detail==="Not found."){
        this.set('currentGithubRepo', null)
      }else{
        this.get("notify").error(this.get('tFailedGitHubProject'));
      }
    }
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
    this.set("githubRepos", null)
    try{
      let data = yield this.get('getGithubRepos').perform()
      this.set("githubRepos", data.results);
    }catch(error){
      if (error.status===400 && error.payload.detail==="Github integration failed"){
        this.set('reconnect', true);
      }
    }
  }),

  selectProject: task( function*() {
    let githubRepo = this.get('currentGithubRepo');
    const tRepoIntegrated = this.get("tRepoIntegrated");
    this.set("isChangingRepo", true);
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
      this.set("isChangingRepo", false);
      this.set("currentGithubRepo",currentGithubRepo);
      this.get("notify").success(tRepoIntegrated);
      yield this.set("showEditGithubModal", false )
    }catch(error){
      yield githubRepo.rollbackAttributes();
      yield this.get('store')._removeFromIdMap(githubRepo._internalModel)
      this.set("isChangingRepo", false)
      if (error.errors[0].source.pointer==="/data/attributes/account" ||
        error.errors[0].source.pointer==="/data/attributes/repo"){
          this.get("notify").error(this.get('tInvalidRepo'))
          return
        }
      if (error.errors[0].source.pointer==="/data/attributes/risk_threshold"){
        this.get("notify").error(this.get('tInvalidRisk'))
        return
      }
      this.get("notify").error(error.errors[0].detail)
    }
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
