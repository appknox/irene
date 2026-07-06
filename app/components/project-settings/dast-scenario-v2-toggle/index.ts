import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ScenarioModel from 'irene/models/scenario';

export interface ProjectSettingsDastScenarioV2StatusToggleSignature {
  Args: {
    project?: ProjectModel | null;
    scenario: ScenarioModel;
    hideToggleLoader?: boolean;
  };
}

export default class ProjectSettingsDastScenarioV2StatusToggleComponent extends Component<ProjectSettingsDastScenarioV2StatusToggleSignature> {
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

      const payload = {
        is_active: checked,
        name: this.scenario.name,
        description: this.scenario.description,
      };

      const projectId = String(this.args.project?.id);

      await waitForPromise(this.scenario.updateScenario(projectId, payload));

      this.notify.success(this.intl.t('dastAutomation.scenarioStatusUpdated'));
    } catch (error) {
      this.scenario.rollbackAttributes();
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastScenarioV2Toggle': typeof ProjectSettingsDastScenarioV2StatusToggleComponent;
  }
}
