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

  get scenario() {
    return this.args.scenario;
  }

  get isNotDefaultScenario() {
    return !this.scenario.isDefault;
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
        'authenticated.project.settings',
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
