import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type DsAutomationPreferenceModel from 'irene/models/ds-automation-preference';

interface ProjectSettingsDastAutomationAutomationSettingsConfigurationSignature {
  Args: {
    profileId?: string | number;
    showScanWindow?: boolean;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsConfigurationComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsConfigurationSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked automationPreference: DsAutomationPreferenceModel | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsDastAutomationAutomationSettingsConfigurationSignature['Args']
  ) {
    super(owner, args);

    this.getDsAutomationPreference.perform();
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

  toggleDsAutomationPreference = task(async (_: Event, enabled: boolean) => {
    try {
      this.automationPreference?.set('dynamicScanAutomationEnabled', enabled);

      const adapter = this.store.adapterFor('ds-automation-preference');
      adapter.setNestedUrlNamespace(String(this.args.profileId));

      await this.automationPreference?.save();

      const successMsg = enabled
        ? this.intl.t('scheduledAutomationSuccessOn')
        : this.intl.t('scheduledAutomationSuccessOff');

      this.notify.success(successMsg);
    } catch (err) {
      this.automationPreference?.rollbackAttributes();
      this.notify.error(parseError(err, this.intl.t('somethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::Configuration': typeof ProjectSettingsDastAutomationAutomationSettingsConfigurationComponent;
  }
}
