import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

export interface ProjectSettingsDastScenarioStatusToggleSignature {
  Args: {
    project?: ProjectModel | null;
    scenario: ScanParameterGroupModel;
    hideToggleLoader?: boolean;
  };
}

export default class ProjectSettingsDastScenarioStatusToggleComponent extends Component<ProjectSettingsDastScenarioStatusToggleSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  get scenario() {
    return this.args.scenario;
  }

  @action handleToggleClick(event: Event) {
    event.stopPropagation();
  }

  @action toggleScenarioStatus(_: Event, checked?: boolean) {
    this.updateScenarioStatus.perform(!!checked);
  }

  updateScenarioStatus = task(async (checked: boolean) => {
    try {
      this.scenario.set('isActive', checked);

      const adapterOptions = { projectId: this.args.project?.id };
      await waitForPromise(this.scenario.save({ adapterOptions }));

      this.notify.success(this.intl.t('dastAutomation.scenarioStatusUpdated'));
    } catch (error) {
      this.scenario.set('isActive', !checked);
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastScenarioToggle': typeof ProjectSettingsDastScenarioStatusToggleComponent;
  }
}
