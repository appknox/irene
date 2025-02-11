import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type DsAutomationPreferenceModel from 'irene/models/ds-automation-preference';
import type OrganizationService from 'irene/services/organization';

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

  @tracked automationPreference: DsAutomationPreferenceModel | null = null;

  constructor(owner: unknown, args: FileDetailsDastAutomatedSignature['Args']) {
    super(owner, args);

    this.getDsAutomationPreference.perform();
  }

  get file() {
    return this.args.file;
  }

  get profileId() {
    return this.file.profile.get('id') as string;
  }

  get dynamicScan() {
    return this.file.lastAutomatedDynamicScan;
  }

  get isFetchingDynamicScan() {
    return this.file.lastAutomatedDynamicScan?.isPending;
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Automated': typeof FileDetailsDastAutomated;
  }
}
