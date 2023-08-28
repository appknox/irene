import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'irene/config/environment';
import ProjectModel from 'irene/models/project';
import { Service as IntlService } from 'ember-intl';
import Store from '@ember-data/store';
import UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';
import { task } from 'ember-concurrency';

interface ProjectSettingsAnalysisSettingsToggleAnalysisSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsAnalysisSettingsToggleAnalysisComponent extends Component<ProjectSettingsAnalysisSettingsToggleAnalysisSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked unknownAnalysisStatus?: UnknownAnalysisStatusModel | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsAnalysisSettingsToggleAnalysisSignature['Args']
  ) {
    super(owner, args);

    this.fetchUnknownAnalysisStatus.perform();
  }

  fetchUnknownAnalysisStatus = task(async () => {
    const profileId = this.args.project?.activeProfileId;
    this.unknownAnalysisStatus = await this.store.queryRecord(
      'unknown-analysis-status',
      {
        id: profileId,
      }
    );
  });

  toggleUnknownAnalysis = task(async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const tSavedPreferences = this.intl.t('savedPreferences');
    const isChecked = target.checked;
    const profileId = this.args.project?.activeProfileId;
    const url = `${ENV.endpoints['profiles']}/${profileId}/${ENV.endpoints['unknownAnalysisStatus']}`;
    const data = { status: isChecked };

    try {
      await this.ajax.put(url, { data });
      this.notify.success(tSavedPreferences);

      if (!this.isDestroyed) {
        if (this.unknownAnalysisStatus) {
          this.unknownAnalysisStatus.status = isChecked;
        }
      }
    } catch (error: any) {
      this.notify.error(error.payload.message);
    }
  });

  @action
  async showUnknownAnalysis(event: Event) {
    this.toggleUnknownAnalysis.perform(event);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::AnalysisSettings::ToggleAnalysis': typeof ProjectSettingsAnalysisSettingsToggleAnalysisComponent;
  }
}
