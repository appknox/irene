import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import ENV from 'irene/config/environment';
import ProjectModel from 'irene/models/project';
import parseError from 'irene/utils/parse-error';

export interface ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
  };
}

export default class ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsComponent extends Component<ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked automationEnabled = false;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsSignature['Args']
  ) {
    super(owner, args);

    this.getDynamicscanMode.perform();
  }

  get profileId() {
    return this.args.profileId;
  }

  get tAppiumScheduledAutomationSuccessOn() {
    return this.intl.t('appiumScheduledAutomationSuccessOn');
  }

  get tAppiumScheduledAutomationSuccessOff() {
    return this.intl.t('appiumScheduledAutomationSuccessOff');
  }

  get tSomethingWentWrong() {
    return this.intl.t('somethingWentWrong');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  getDynamicscanMode = task(async () => {
    try {
      const dynScanMode = await waitForPromise(
        this.store.queryRecord('dynamicscan-mode', {
          id: this.profileId,
        })
      );

      this.automationEnabled = dynScanMode.dynamicscanMode === 'Automated';
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });

  toggleDynamicscanMode = task(async () => {
    try {
      this.automationEnabled = !this.automationEnabled;

      const dynamicscanMode = [
        ENV.endpoints['profiles'],
        this.profileId,
        ENV.endpoints['dynamicscanMode'],
      ].join('/');

      const data = {
        dynamicscan_mode: this.automationEnabled ? 'Automated' : 'Manual',
      };

      await waitForPromise(this.ajax.put(dynamicscanMode, { data }));

      const successMsg = this.automationEnabled
        ? this.tAppiumScheduledAutomationSuccessOn
        : this.tAppiumScheduledAutomationSuccessOff;

      this.notify.success(successMsg);
    } catch (err) {
      const error = err as AdapterError;
      this.automationEnabled = !this.automationEnabled;

      if (error.payload) {
        Object.keys(error.payload).forEach((p) => {
          let errMsg = error.payload[p];

          if (typeof errMsg !== 'string') {
            errMsg = error.payload[p][0];
          }

          this.notify.error(errMsg);
        });

        return;
      }

      this.notify.error(parseError(error, this.tSomethingWentWrong));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DynamicscanAutomationSettings': typeof ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsComponent;
  }
}
