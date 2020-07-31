import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';
import ENUMS from 'irene/enums';
import { on } from '@ember/object/evented';


const JiraProjectComponent = Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  project: null,
  jiraProjects: null,
  tIntegratedJIRA: t("integratedJIRA"),
  tProjectRemoved: t("projectRemoved"),
  tRepoNotIntegrated: t("repoNotIntegrated"),
  tFetchJIRAProjectFailed: t("fetchProjectFailed"),
  thresholds: computed(function(){
    return ENUMS.THRESHOLD.CHOICES.filter(c => c.key !== 'UNKNOWN').map(c => c.value)
  }),
  selectedThreshold: ENUMS.THRESHOLD.LOW,
  noIntegration: false,
  noAccess: false,
  currentJiraProject: null,
  selectedRepo: null,
  tInvalidRepo: t("invalidProject"),
  tInvalidRisk: t("tInvalidRisk"),

  hasJIRAProject: computed.gt('jiraProjects.length', 0),

  setCurrentJiraRepo: task(function *(){
    return yield this.get("store").findRecord(
      'jira-repo', this.get('project.id'));
  }).evented(),

  setCurrentJiraRepoErrored: on('setCurrentJiraRepo:errored', function(_, err){
    if (err.errors[0].detail && err.errors[0].detail==="JIRA not integrated"){
      this.set('noIntegration', true);
      return
    }
    if (err.errors[0].detail && err.errors[0].detail==="JIRA integration failed"){
      this.set('reconnect', true);
      return
    }
    this.get("notify").error(this.get('tFetchJIRAProjectFailed'));
  }),

  setCurrentJiraRepoSucceded: on('setCurrentJiraRepo:succeeded', function(instance){
      this.set('currentJiraProject', instance.value)
      this.set('selectedRepo',{
        key: instance.value.get('project_key'),
        name: instance.value.get('project_name')
      })
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
    return yield this.get('currentJiraProject').destroyRecord()
  }).evented(),

  deleteRepoErrored: on('deleteRepo:errored', function(_, err){
    this.get("notify").error(err.payload.detail);
    this.send("closeDeleteJIRAConfirmBox");
  }),
  deleteRepoSucceded: on('deleteRepo:succeeded', function(instance){
    const tProjectRemoved = this.get("tProjectRemoved");
    this.get('store')._removeFromIdMap(instance.value._internalModel)
    this.get('currentJiraProject').unloadRecord();
    this.get("notify").success(tProjectRemoved);
    this.send("closeDeleteJIRAConfirmBox");
    this.set('currentJiraProject', null);
    this.set('selectedRepo', null);
    this.set('selectedThreshold', 1);
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
      throw error
    }
  }).evented(),

  selectProjectErrored: on('selectProject:errored', function(_, error){
    if (error.errors[0].detail==="JIRA not integrated"){
      this.set("showEditJiraModal", false )
      this.set('jiraProjects', null);
      this.set('noIntegration', true);
      this.set("currentJiraProject", null);
      this.get("notify").error(error.errors[0].detail);
      return
    }
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
