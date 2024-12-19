import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';
import type DsAutomationPreferenceModel from 'irene/models/ds-automation-preference';

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
  @service('notifications') declare notify: NotificationService;

  @tracked isFullscreenView = false;
  @tracked automationPreference: DsAutomationPreferenceModel | null = null;
  @tracked dynamicScan: DynamicscanModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastAutomatedSignature['Args']) {
    super(owner, args);

    this.getDynamicscanMode.perform();
    this.fetchDynamicscan.perform();
  }

  @action
  handleFullscreenClose() {
    this.isFullscreenView = false;
  }

  @action
  toggleFullscreenView() {
    this.isFullscreenView = !this.isFullscreenView;
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
    this.dynamicScan = dynamicScan;
  }

  getDynamicscanMode = task(async () => {
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

  fetchDynamicscan = task(async () => {
    const file = this.args.file;

    try {
      this.dynamicScan = await file.getLastDynamicScan(
        file.id,
        ENUMS.DYNAMIC_MODE.AUTOMATED
      );
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Automated': typeof FileDetailsDastAutomated;
  }
}
