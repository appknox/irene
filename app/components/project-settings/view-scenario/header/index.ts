import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import ProjectModel from 'irene/models/project';
import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import parseError from 'irene/utils/parse-error';

interface ProjectSettingsViewScenarioHeaderSignature {
  Args: {
    project: ProjectModel | null;
    scenario: ScanParameterGroupModel;
  };
}

export default class ProjectSettingsViewScenarioHeaderComponent extends Component<ProjectSettingsViewScenarioHeaderSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked showDeleteScenarioModal = false;
  @tracked showEditScenarioModal = false;
  @tracked scenarioName = '';
  @tracked scenarioDescription = '';
  @tracked scenarioStatus = false;

  get scenario() {
    return this.args.scenario;
  }

  get isNotDefaultScenario() {
    return !this.scenario.isDefault;
  }

  get disableScenarioSaveBtn() {
    return !this.scenarioName;
  }

  @action openEditScenarioModal() {
    this.scenarioName = this.scenario.name || '';
    this.scenarioDescription = this.scenario.description || '';
    this.scenarioStatus = !!this.scenario.isActive;
    this.showEditScenarioModal = true;
  }

  @action closeEditScenarioModal() {
    this.showEditScenarioModal = false;
  }

  @action handleScenarioNameChange(event: Event) {
    this.scenarioName = (event.target as HTMLInputElement).value;
  }

  @action handleScenarioDescriptionChange(event: Event) {
    this.scenarioDescription = (event.target as HTMLInputElement).value;
  }

  @action toggleScenarioStatus(_: Event, checked?: boolean) {
    this.scenarioStatus = !!checked;
  }

  @action saveEditedScenario() {
    this.updateProjectScenario.perform();
  }

  @action handleDeleteScenario() {
    this.showDeleteScenarioModal = true;
  }

  @action hideDeleteScenarioModal() {
    this.showDeleteScenarioModal = false;
  }

  @action deleteScenario() {
    this.deleteProjectScenario.perform();
  }

  updateProjectScenario = task(async () => {
    if (!this.scenarioName) {
      this.notify.error(this.intl.t('dastAutomation.enterScenarioName'));

      return;
    }

    const prevScenarioData = {
      name: this.scenario.name,
      description: this.scenario.description,
      isActive: this.scenario.isActive,
    };

    try {
      this.scenario.setProperties({
        name: this.scenarioName,
        description: this.scenarioDescription,
        isActive: this.scenarioStatus,
      });

      const adapterOptions = { projectId: this.args.project?.id };
      await this.scenario.save({ adapterOptions });

      this.notify.success(this.intl.t('save'));
      this.closeEditScenarioModal();
    } catch (error) {
      this.scenario.setProperties(prevScenarioData);
      this.notify.error(parseError(error, this.intl.t('tSomethingWentWrong')));
    }
  });

  deleteProjectScenario = task(async () => {
    try {
      const adapterOptions = { projectId: this.args.project?.id };

      await this.scenario.destroyRecord({ adapterOptions });

      this.notify.success(
        this.intl.t('dastAutomation.scenarioDeleted', {
          scenarioName: this.scenario.name,
        })
      );

      this.router.transitionTo(
        'authenticated.dashboard.project.settings',
        String(this.args.project?.id)
      );
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('tSomethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ViewScenario::Header': typeof ProjectSettingsViewScenarioHeaderComponent;
  }
}
