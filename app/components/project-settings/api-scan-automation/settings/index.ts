import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ApiscanAutomationPreferenceModel from 'irene/models/apiscan-automation-preference';

export interface ProjectSettingsApiScanAutomationSettingsSignature {
  Args: {
    profileId?: string | number;
  };
}

export default class ProjectSettingsApiScanAutomationSettingsComponent extends Component<ProjectSettingsApiScanAutomationSettingsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked options?: ApiscanAutomationPreferenceModel;
  @tracked enabled = false;

  constructor(
    owner: unknown,
    args: ProjectSettingsApiScanAutomationSettingsSignature['Args']
  ) {
    super(owner, args);

    this.fetchOptions.perform();
  }

  // A toggle before the current value has loaded would overwrite it
  get toggleDisabled() {
    return this.fetchOptions.isRunning || !this.options || this.save.isRunning;
  }

  // The nested adapter resets its namespace after every response
  setPreferenceNamespace() {
    this.store
      .adapterFor('apiscan-automation-preference')
      .setNestedUrlNamespace(String(this.args.profileId));
  }

  @action
  handleToggleChange(_: Event, enabled?: boolean) {
    this.enabled = Boolean(enabled);
    this.save.perform();
  }

  fetchOptions = task(async () => {
    if (!this.args.profileId) {
      return;
    }

    try {
      this.setPreferenceNamespace();

      this.options = await this.store.queryRecord(
        'apiscan-automation-preference',
        {}
      );

      this.enabled = this.options.apiScanAutomationEnabled;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  save = task(async () => {
    try {
      this.options?.setProperties({
        apiScanAutomationEnabled: this.enabled,
      });

      this.setPreferenceNamespace();

      await this.options?.save();

      this.notify.success(this.intl.t('apiScanAutomation.settingsUpdated'));
    } catch (error) {
      this.options?.rollbackAttributes();
      this.enabled = Boolean(this.options?.apiScanAutomationEnabled);

      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ApiScanAutomation::Settings': typeof ProjectSettingsApiScanAutomationSettingsComponent;
  }
}
