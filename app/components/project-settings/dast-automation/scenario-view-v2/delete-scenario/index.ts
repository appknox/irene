import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ScenarioDetailModel from 'irene/models/scenario-detail';

interface ProjectSettingsDastAutomationScenarioViewV2DeleteScenarioSignature {
  Args: {
    project: ProjectModel | null;
    scenarioDetail: ScenarioDetailModel;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2DeleteScenarioComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2DeleteScenarioSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked showDeleteScenarioModal = false;

  get scenarioDetail() {
    return this.args.scenarioDetail;
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

      await this.scenarioDetail.destroyRecord({ adapterOptions });

      this.notify.success(
        this.intl.t('dastAutomation.scenarioDeleted', {
          scenarioName: this.scenarioDetail.name,
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
    'ProjectSettings::DastAutomation::ScenarioViewV2::DeleteScenario': typeof ProjectSettingsDastAutomationScenarioViewV2DeleteScenarioComponent;
  }
}
