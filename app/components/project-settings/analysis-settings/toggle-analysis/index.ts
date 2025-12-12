import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type ProjectModel from 'irene/models/project';

interface ProjectSettingsAnalysisSettingsToggleAnalysisSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class ProjectSettingsAnalysisSettingsToggleAnalysisComponent extends Component<ProjectSettingsAnalysisSettingsToggleAnalysisSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked unknownAnalysisStatus: boolean;

  constructor(
    owner: unknown,
    args: ProjectSettingsAnalysisSettingsToggleAnalysisSignature['Args']
  ) {
    super(owner, args);

    this.unknownAnalysisStatus = !!this.args.project?.get(
      'showUnknownAnalysis'
    );
  }

  toggleUnknownAnalysis = task(async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const tSavedPreferences = this.intl.t('savedPreferences');
    const isChecked = target.checked;
    const profileId = this.args.project?.activeProfileId;
    const url = `${ENV.endpoints['profiles']}/${profileId}/${ENV.endpoints['unknownAnalysisStatus']}`;
    const data = { status: isChecked };

    try {
      await this.ajax.put(url, { data });
      await this.args.project?.reload();
      this.notify.success(tSavedPreferences);

      if (!this.isDestroyed) {
        if (this.unknownAnalysisStatus) {
          this.unknownAnalysisStatus = isChecked;
        }
      }
    } catch (error) {
      this.notify.error(parseError(error));
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
