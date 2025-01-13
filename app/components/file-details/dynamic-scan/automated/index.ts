import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type DsAutomationPreferenceModel from 'irene/models/ds-automation-preference';
import type OrganizationService from 'irene/services/organization';
import type DynamicScanService from 'irene/services/dynamic-scan';

export interface FileDetailsDastAutomatedSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
}

export default class FileDetailsDastAutomated extends Component<FileDetailsDastAutomatedSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service('dynamic-scan') declare dsService: DynamicScanService;
  @service('notifications') declare notify: NotificationService;

  @tracked automationPreference: DsAutomationPreferenceModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastAutomatedSignature['Args']) {
    super(owner, args);

    this.getDsAutomationPreference.perform();
  }

  get dynamicScan() {
    return this.dsService.automatedScan;
  }

  get isFetchingDynamicScan() {
    return this.dsService.fetchLatestAutomatedScan.isRunning;
  }

  get dynamicscanAutomationFeatureAvailable() {
    return !!this.organization.selected?.features?.dynamicscan_automation;
  }

  @action
  goToSettings() {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings',
      String(this.args.file?.project?.get('id'))
    );
  }

  @action
  handleStartScan(dynamicScan: DynamicscanModel) {
    this.dsService.automatedScan = dynamicScan;
  }

  @action
  handleScanShutdown() {
    this.dsService.fetchLatestAutomatedScan.perform(this.args.file);
  }

  getDsAutomationPreference = task(async () => {
    try {
      const adapter = this.store.adapterFor('ds-automation-preference');
      adapter.setNestedUrlNamespace(String(this.args.profileId));

      this.automationPreference = await this.store.queryRecord(
        'ds-automation-preference',
        {}
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Automated': typeof FileDetailsDastAutomated;
  }
}
