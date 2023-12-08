import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { action } from '@ember/object';

import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

export interface ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableStatusSignature {
  Args: {
    project?: ProjectModel;
    scenario: ScanParameterGroupModel;
    reloadScenarioList(): void;
  };
}

export default class ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableStatusComponent extends Component<ProjectSettingsGeneralSettingsDynamicscanAutomationScenarioTableStatusSignature> {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @action handleToggleClick(event: Event) {
    event.stopPropagation();
  }

  @action toggleScenarioStatus(_: Event, checked?: boolean) {
    this.updateScenarioStatus.perform(!!checked);
  }

  updateScenarioStatus = task(async (checked: boolean) => {
    const scanParamGroupUrl = [
      ENV.endpoints['projects'],
      this.args.project?.id,
      ENV.endpoints['scanParameterGroups'],
      this.args.scenario.id,
    ].join('/');

    try {
      await this.ajax.put(scanParamGroupUrl, {
        namespace: ENV.namespace_v2,
        data: {
          is_active: checked,
        },
      });
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}
