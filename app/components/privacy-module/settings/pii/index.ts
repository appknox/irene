import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type PrivacyPiiSettingsModel from 'irene/models/privacy-pii-settings';
import type PrivacyModuleService from 'irene/services/privacy-module';

interface PiiSettingItem {
  value: boolean;
  settings_parameter: string;
  label?: string;
}

export default class PrivacyModuleSettingsPiiComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare privacyModule: PrivacyModuleService;

  @tracked piiSettings: PrivacyPiiSettingsModel | null = null;
  @tracked newRegex = '';

  @tracked customRegexList: string[] = [];
  @tracked piiSettingsList: PiiSettingItem[] = [];
  @tracked piiVisible: boolean = true;

  @tracked originalCustomRegex: string[] = [];
  @tracked originalPiiVisible: boolean = true;
  @tracked originalPiiSettings: PiiSettingItem[] = [];

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchPiiSettings.perform();
  }

  get disableSaveButton() {
    return Object.keys(this.privacyModule.updatedSettings).length === 0;
  }

  @action
  togglePiiVisible(event: Event, checked?: boolean) {
    this.piiVisible = checked ?? false;

    this.toggleSetting('mask_pii', !this.piiVisible);
  }

  @action
  togglePiiItem(key: string, event: Event, checked?: boolean) {
    this.toggleSetting(key, checked);
  }

  @action
  toggleSetting(key: string, value?: boolean) {
    if (key in this.privacyModule.updatedSettings) {
      const updated = { ...this.privacyModule.updatedSettings };

      delete updated[key];

      this.privacyModule.updatedSettings = updated;
    } else {
      this.privacyModule.updatedSettings = {
        ...this.privacyModule.updatedSettings,
        [key]: value,
      };
    }
  }

  @action
  addRegex() {
    const value = this.newRegex.trim();

    if (!value) {
      return;
    }

    if (this.customRegexList.includes(value)) {
      this.notify.error(this.intl.t('privacyModule.patternAlreadyExists'));

      return;
    }

    const updated = [...this.customRegexList, value];

    this.customRegexList = updated;
    this.newRegex = '';

    this.updateRegexDiff(updated);
  }

  @action
  handleRegexDelete(index: number) {
    const updated = this.customRegexList.filter((_, i) => i !== index);
    this.customRegexList = updated;

    this.updateRegexDiff(updated);
  }

  @action
  updateRegexDiff(updated: string[]) {
    const normalize = (arr: string[]) =>
      [...arr].sort((a, b) => a.localeCompare(b)).join('\0');

    const isSame = normalize(updated) === normalize(this.originalCustomRegex);
    const rest = { ...this.privacyModule.updatedSettings };

    delete rest['pii_custom_regex'];

    this.privacyModule.updatedSettings = isSame
      ? rest
      : { ...rest, pii_custom_regex: updated };
  }

  @action
  handleCancel() {
    // restore custom
    this.customRegexList = [...this.originalCustomRegex];

    // restore default
    this.piiSettingsList = this.originalPiiSettings.map(
      (item: PiiSettingItem) => ({
        ...item,
      })
    );

    this.piiVisible = this.originalPiiVisible;
    this.privacyModule.updatedSettings = {};
    this.newRegex = '';
  }

  @action
  syncOriginalState() {
    this.originalCustomRegex = [...this.customRegexList];
    this.originalPiiVisible = this.piiVisible;
    this.originalPiiSettings = this.piiSettingsList.map((item) => ({
      ...item,
    }));
  }

  fetchPiiSettings = task(async () => {
    try {
      this.piiSettings = await this.store.queryRecord(
        'privacy-pii-settings',
        {}
      );

      this.customRegexList = this.piiSettings?.customRegex ?? [];
      this.piiVisible = !this.piiSettings.maskPii;

      this.piiSettingsList = this.piiSettings.piiSettings.map((item) => {
        const camelKey = item.settings_parameter
          .replace(/^pii_/, '')
          .replace(/_([a-z])/g, (_, c) => c.toUpperCase());

        return {
          ...item,
          label:
            this.intl.t(`privacyModule.piiTypes.${camelKey}`) ||
            item.settings_parameter,
        };
      });

      this.syncOriginalState();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  saveSettings = task(async () => {
    try {
      if (this.piiSettings) {
        await this.piiSettings.savePiiSettings(
          this.piiSettings.id,
          this.privacyModule.updatedSettings
        );
      }

      this.syncOriginalState();

      this.privacyModule.updatedSettings = {};
      this.notify.success(this.intl.t('successfullySaved'));
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::Settings::Pii': typeof PrivacyModuleSettingsPiiComponent;
    'privacy-module/settings/pii': typeof PrivacyModuleSettingsPiiComponent;
  }
}
