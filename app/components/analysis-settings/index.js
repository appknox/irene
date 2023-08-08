import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'irene/config/environment';

export default class AnalysisSettingsComponent extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;
  @service store;

  @tracked isSavingStatus = false;
  @tracked unknownAnalysisStatus = null;

  constructor(owner, args) {
    super(owner, args);

    this.loadData();
  }

  async loadData() {
    const profileId = this.args.project.activeProfileId;
    this.unknownAnalysisStatus = await this.store.queryRecord('unknown-analysis-status', { id: profileId });
  }

  @action
  async showUnknownAnalysis(event) {
    const tSavedPreferences = this.intl.t('savedPreferences');
    const isChecked = event.target.checked;
    const profileId = this.args.project.activeProfileId;
    const url = `${ENV.endpoints.profiles}/${profileId}/${ENV.endpoints.unknownAnalysisStatus}`;
    const data = { status: isChecked };

    this.isSavingStatus = true;

    try {
      await this.ajax.put(url, { data });
      this.notify.success(tSavedPreferences);

      if (!this.isDestroyed) {
        this.isSavingStatus = false;
        this.unknownAnalysisStatus.status = isChecked;
      }
    } catch (error) {
      this.isSavingStatus = false;
      this.notify.error(error.payload.message);
    }
  }
}
