import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { translationMacro as t } from 'ember-i18n';
import ENUMS from 'irene/enums';

const JiraProjectComponent = Component.extend({
  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  project: null,
  jiraProjects: null,
  tIntegratedJIRA: t("integratedJIRA"),
  tProjectRemoved: t("projectRemoved"),
  tRepoNotIntegrated: t("repoNotIntegrated"),
  tFetchJIRAProjectFailed: t("fetchProjectFailed"),
  thresholds: ENUMS.THRESHOLD.CHOICES.filter(c => c.key !== 'UNKNOWN').map(c => c.value),
  selectedThreshold: ENUMS.THRESHOLD.LOW,
  noIntegration: false,
  noAccess: false,
  currentJiraProject: null,
  selectedRepo: null,
  tInvalidRepo: t("invalidProject"),
  tInvalidRisk: t("tInvalidRisk"),
  hasJIRAProject: computed('jiraProjects.length', function(){
    return this.get('jiraProjects.length') > 0
  }),
  setCurrentJiraRepo: task(function *(){
    try{
      let currentJiraProject = yield this.get("store").findRecord(
        'jira-repo', this.get('project.id'));
      this.set('currentJiraProject', currentJiraProject)
      this.set('selectedRepo',{
        key: currentJiraProject.get('project_key'),
        name: currentJiraProject.get('project_name')
      })
    }catch(err){
      const status = err.errors[0].status
      if (status==="404" && err.errors[0].detail==="Not found."){
        this.set('currentGithubRepo', null)
      }else{
        this.get("notify").error(this.get('tFetchJIRAProjectFailed'));
      }
    }
  }),
  didInsertElement() {
    this.get('fetchJIRAProjects').perform();
    this.get('setCurrentJiraRepo').perform();
  },
  fetchJIRAProjects: task(function* (){
    this.set('noAccess', false);
    this.set('noIntegration', false);
    this.set('jiraProjects', null);
    try{
      const jiraprojects = yield this.get('store').query(
          'organizationJiraproject', {}
      );
      this.set('jiraProjects', jiraprojects);
    } catch (error) {
      if(error.errors) {
        const status = error.errors[0].status;
        if(status == 403) {
          this.set('noAccess', true);
          return
        } else if(status == 404) {
          this.set('noIntegration', true);
          return
        }
        throw error;
      }
    }
  }),
  deleteRepo: task(function *(){
    const tProjectRemoved = this.get("tProjectRemoved");
    return yield this.get('currentJiraProject').destroyRecord()
      .then((data)=>{
        this.get('store')._removeFromIdMap(data._internalModel)
        this.get('currentJiraProject').unloadRecord();
        this.get("notify").success(tProjectRemoved);
        this.send("closeDeleteJIRAConfirmBox");
        this.set('currentJiraProject', null);
        this.set('selectedRepo', null);
        this.set('selectedThreshold', 1);
      },(error)=>{
        this.get("notify").error(error.payload.error);
    })
  }),
  confirmCallback(){
    this.get('deleteRepo').perform();
  },
  selectProject: task( function *(){
    let jiraProject = this.get('currentJiraProject');
    if (jiraProject){
      jiraProject.setProperties(
        {
          project_key: this.get('selectedRepo.key'),
          project_name: this.get('selectedRepo.name'),
          risk_threshold: this.get('selectedThreshold')
        }
      );
    }else{
      jiraProject = this.get('store').createRecord(
        'jira-repo',{
          id: this.get('project.id'),
          project_key: this.get('selectedRepo.key'),
          project_name:this.get('selectedRepo.name'),
          risk_threshold: this.get('selectedThreshold'),
          project: this.get('project')
        }
      )
    }
    try{
      yield jiraProject.save();
      this.set("currentJiraProject",jiraProject);
      this.get("notify").success(this.get('tIntegratedJIRA'));
      yield this.set("showEditJiraModal", false )
    }catch(error){
      yield jiraProject.rollbackAttributes();
      yield this.get('store')._removeFromIdMap(jiraProject._internalModel)
      this.set("isChangingRepo", false)
      if (error.errors[0].source.pointer==="/data/attributes/project_key" ||
        error.errors[0].source.pointer==="/data/attributes/project_key"){
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
  editJiraRepoModal: task(function *(){
    yield this.set("showEditJiraModal", true )
  }),

  closeJiraRepoModal: task(function *(){
    yield this.set("showEditJiraModal", false )
  }),

  selectRepo: task(function *(repo){
    yield this.set('selectedRepo', repo.toJSON());
  }),

  selectThreshold: task(function *(threshold){
    yield this.set('selectedThreshold', threshold);
  }),
  actions: {
    openDeleteJIRAConfirmBox() {
      this.set("showDeleteJIRAConfirmBox", true);
    },

    closeDeleteJIRAConfirmBox() {
      this.set("showDeleteJIRAConfirmBox", false);
    }
  }
});

export default JiraProjectComponent;
