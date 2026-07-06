import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ScenarioModel from 'irene/models/scenario';

interface ProjectSettingsDastAutomationScenarioViewV2EditScenarioSignature {
  Args: {
    project?: ProjectModel | null;
    scenario: ScenarioModel;
    onSuccess?: () => void;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2EditScenarioComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2EditScenarioSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showEditScenarioModal = false;
  @tracked editScenarioName = '';

  get scenario() {
    return this.args.scenario;
  }

  get disableEditSaveBtn() {
    const trimmed = this.editScenarioName.trim();

    return !trimmed || trimmed === this.scenario.name;
  }

  get isDefaultScenario() {
    return this.scenario.isLoginType;
  }

  @action handleEditScenario(event: Event) {
    event.stopPropagation();

    this.editScenarioName = this.scenario.name;
    this.showEditScenarioModal = true;
  }

  @action hideEditScenarioModal() {
    this.showEditScenarioModal = false;
  }

  @action handleEditNameChange(event: Event) {
    this.editScenarioName = (event.target as HTMLInputElement).value;
  }

  @action saveScenario() {
    this.editProjectScenario.perform();
  }

  editProjectScenario = task(async () => {
    const projectId = this.args.project?.id;

    if (!projectId) {
      return;
    }

    const originalName = this.scenario.name;
    const newName = this.editScenarioName.trim();

    try {
      this.scenario.name = newName;

      await this.scenario.updateScenario(projectId, {
        name: newName,
        description: this.scenario.description,
        is_active: this.scenario.isActive,
      });

      this.notify.success(this.intl.t('dastAutomation.scenarioUpdated'));
      this.hideEditScenarioModal();
      this.args.onSuccess?.();
    } catch (err) {
      this.scenario.name = originalName;
      this.notify.error(parseError(err, this.intl.t('somethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::EditScenario': typeof ProjectSettingsDastAutomationScenarioViewV2EditScenarioComponent;
  }
}
