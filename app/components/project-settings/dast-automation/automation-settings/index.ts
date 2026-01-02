import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type DsAutomationPreferenceModel from 'irene/models/ds-automation-preference';

export interface ProjectSettingsDastAutomationAutomationSettingsSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
    featureAvailable: boolean;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked automationPreference: DsAutomationPreferenceModel | null = null;

  constructor(
    owner: unknown,
    args: ProjectSettingsDastAutomationAutomationSettingsSignature['Args']
  ) {
    super(owner, args);

    this.getDsAutomationPreference.perform();
  }

  get profileId() {
    return this.args.profileId;
  }

  get tScheduledAutomationSuccessOn() {
    return this.intl.t('scheduledAutomationSuccessOn');
  }

  get tScheduledAutomationSuccessOff() {
    return this.intl.t('scheduledAutomationSuccessOff');
  }

  get tSomethingWentWrong() {
    return this.intl.t('somethingWentWrong');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  getDsAutomationPreference = task(async () => {
    try {
      const adapter = this.store.adapterFor('ds-automation-preference');
      adapter.setNestedUrlNamespace(String(this.profileId));

      this.automationPreference = await this.store.queryRecord(
        'ds-automation-preference',
        {}
      );
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });

  toggleDsAutomationPreference = task(async (_: Event, enabled: boolean) => {
    try {
      this.automationPreference?.set('dynamicScanAutomationEnabled', enabled);

      const adapter = this.store.adapterFor('ds-automation-preference');
      adapter.setNestedUrlNamespace(String(this.profileId));

      await this.automationPreference?.save();

      const successMsg = enabled
        ? this.tScheduledAutomationSuccessOn
        : this.tScheduledAutomationSuccessOff;

      this.notify.success(successMsg);
    } catch (err) {
      this.automationPreference?.rollbackAttributes();

      this.notify.error(parseError(err, this.tSomethingWentWrong));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings': typeof ProjectSettingsDastAutomationAutomationSettingsComponent;
  }
}
