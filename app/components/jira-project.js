import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

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
  noIntegration: false,
  noAccess: false,
  hasJIRAProject: computed('jiraProjects.length', function(){
    return this.get('jiraProjects.length') > 0
  }),
  didInsertElement() {
    this.get('fetchJIRAProjects').perform();
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
