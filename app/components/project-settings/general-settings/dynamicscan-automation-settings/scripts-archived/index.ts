// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import ProjectModel from 'irene/models/project';
import AutomationScriptModel from 'irene/models/automation-script';
import parseError from 'irene/utils/parse-error';

type DyanmicscanAutomationSettingsQueryResponse =
  DS.AdapterPopulatedRecordArray<AutomationScriptModel> & {
    meta: { count: number };
  };

export interface ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScriptsSignature {
  Args: {
    project?: ProjectModel | null;
    profileId?: string | number;
  };
}

export default class ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScriptsComponent extends Component<ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScriptsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked
  automationScripts: DyanmicscanAutomationSettingsQueryResponse | null = null;

  @tracked automationEnabled = false;

  constructor(
    owner: unknown,
    args: ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScriptsSignature['Args']
  ) {
    super(owner, args);

    this.getAutomationScripts.perform();
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

  getAutomationScripts = task(async () => {
    try {
      this.automationScripts = (await this.store.query('automation-script', {
        profileId: this.profileId,
      })) as DyanmicscanAutomationSettingsQueryResponse;
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });

  getDynamicscanMode = task(async () => {
    try {
      const dynScanMode = await this.store.queryRecord('dynamicscan-mode', {
        id: this.profileId,
      });

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

      await this.ajax.put(dynamicscanMode, { data });

      const successMsg = this.automationEnabled
        ? this.tAppiumScheduledAutomationSuccessOn
        : this.tAppiumScheduledAutomationSuccessOff;

      this.notify.success(successMsg);
    } catch (error) {
      this.automationEnabled = !this.automationEnabled;
      this.notify.error(parseError(error, this.tSomethingWentWrong));
    }
  });

  uploadFile = task(async (file: any) => {
    try {
      const urlGetSignedUrl = [
        ENV.endpoints['profiles'],
        this.profileId,
        ENV.endpoints['uploadAutomationScriptSignedUrl'],
      ].join('/');

      const signedUrlData = {
        file_name: file.blob.name,
      };

      const signedUrlResponse = await this.ajax.post(urlGetSignedUrl, {
        data: signedUrlData,
      });

      await file.uploadBinary(signedUrlResponse.url, { method: 'PUT' });

      const urlUploadScript = [
        ENV.endpoints['profiles'],
        this.profileId,
        ENV.endpoints['uploadAutomationScript'],
      ].join('/');

      const uploadAutomationScriptData = {
        file_key: signedUrlResponse.file_key,
        file_key_signed: signedUrlResponse.file_key_signed,
      };

      await this.ajax.post(urlUploadScript, {
        data: uploadAutomationScriptData,
      });

      this.notify.success(this.intl.t('appiumFileUploadedSuccessfully'));

      this.getAutomationScripts.perform();
    } catch (err) {
      const error = err as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (error.payload) {
        Object.keys(error.payload).forEach((p) => {
          errMsg = error.payload[p];

          if (typeof errMsg !== 'string') {
            errMsg = error.payload[p][0];
          }

          this.notify.error(errMsg);
        });

        return;
      }

      this.notify.error(parseError(error, errMsg));
    }
  });

  @action
  uploadFileWrapper(file: any) {
    this.uploadFile.perform(file);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::ScriptsArchived': typeof ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsScriptsComponent;
  }
}
