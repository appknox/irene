import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class ProjectSettings extends Component {
  @tracked isGeneralSettings = true;
  @tracked isAnalysisSettings = false;
  @tracked profile = null;

  @service me;
  @service organization;
  @service store;

  constructor() {
    super(...arguments);
    this.fetchProfile.perform();
  }

  @task(function* () {
    try {
      const profileId = this.args.project.activeProfileId;
      this.profile = yield this.store.findRecord('profile', profileId);
    } catch (e) {
      this.profile = null;
      return;
    }
  })
  fetchProfile;

  get project() {
    return this.args.project;
  }

  get generalSettingsClass() {
    return this.isGeneralSettings ? 'is-active' : undefined;
  }

  get analysisSettingsClass() {
    return this.isAnalysisSettings ? 'is-active' : undefined;
  }

  @action
  displayGeneralSettings() {
    this.isGeneralSettings = true;
    this.isAnalysisSettings = false;
  }
  @action
  displayAnalysisSettings() {
    this.isGeneralSettings = false;
    this.isAnalysisSettings = true;
  }
}
