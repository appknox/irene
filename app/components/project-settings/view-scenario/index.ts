import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import ProjectModel from 'irene/models/project';
import ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import parseError from 'irene/utils/parse-error';
import ScanParameterModel from 'irene/models/scan-parameter';

interface ProjectSettingsViewScenarioSignature {
  Args: {
    project: ProjectModel | null;
    scenario: ScanParameterGroupModel;
  };
}

export default class ProjectSettingsViewScenarioComponent extends Component<ProjectSettingsViewScenarioSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service declare ajax: any;

  @tracked parameterList: ScanParameterModel[] = [];

  model = {};

  constructor(
    owner: unknown,
    args: ProjectSettingsViewScenarioSignature['Args']
  ) {
    super(owner, args);

    this.fetchScanParameters.perform();
  }

  get scenario() {
    return this.args.scenario;
  }

  @action reloadParameterList() {
    this.fetchScanParameters.perform();
  }

  fetchScanParameters = task(async () => {
    try {
      const parameterList = await this.store.query('scan-parameter', {
        groupId: this.args.scenario?.id,
      });

      this.parameterList = parameterList.toArray();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ViewScenario': typeof ProjectSettingsViewScenarioComponent;
  }
}
