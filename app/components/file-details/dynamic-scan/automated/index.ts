import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type DsAutomationPreferenceModel from 'irene/models/ds-automation-preference';
import type OrganizationService from 'irene/services/organization';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type LoggerService from 'irene/services/logger';
import type EventBusService from 'irene/services/event-bus';

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
  @service('notifications') declare notify: NotificationService;
  @service declare logger: LoggerService;
  @service declare eventBus: EventBusService;

  @tracked automationPreference: DsAutomationPreferenceModel | null = null;
  @tracked lastAutomatedDynamicScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastAutomatedSignature['Args']) {
    super(owner, args);

    this.getDsAutomationPreference.perform();
    this.getLastAutomatedDynamicScan.perform();

    this.eventBus.on(
      'ws:dynamicscan:update',
      this,
      this.handleDynamicScanUpdate
    );
  }

  get file() {
    return this.args.file;
  }

  get profileId() {
    return this.file.profile.get('id') as string;
  }

  get isFetchingDynamicScan() {
    return this.getLastAutomatedDynamicScan.isRunning;
  }

  get dynamicscanAutomationFeatureAvailable() {
    return !!this.organization.selected?.features?.dynamicscan_automation;
  }

  @action
  goToSettings() {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings.dast-automation',
      String(this.args.file?.project?.get('id'))
    );
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

  @action
  reloadLastAutomatedDynamicScan() {
    this.getLastAutomatedDynamicScan.perform();
  }

  @action
  handleDynamicScanUpdate(dynamicscan: DynamicscanModel) {
    if (String(dynamicscan.file.get('id')) === String(this.file.id)) {
      this.getLastAutomatedDynamicScan.perform();
    }
  }

  getLastAutomatedDynamicScan = task({ restartable: true }, async () => {
    try {
      this.lastAutomatedDynamicScan =
        await this.file.getFileLastAutomatedDynamicScan();
    } catch (error) {
      this.logger.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  willDestroy(): void {
    super.willDestroy();

    this.eventBus.off(
      'ws:dynamicscan:update',
      this,
      this.handleDynamicScanUpdate
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Automated': typeof FileDetailsDastAutomated;
  }
}
