import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type PrivacyServerLocationSettingsModel from 'irene/models/privacy-server-location-settings';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type { PrivacySettingsUpdatePayload } from 'irene/services/privacy-module';

interface GeoSettingItem {
  value: boolean;
  settings_parameter: string;
  countryName?: string;
}

interface CountryOption {
  label: string;
  value: string;
}

interface WorldFeature {
  properties?: {
    name?: string;
    countryName?: string;
  };
}

export default class PrivacyModuleSettingsServerLocationComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare privacyModule: PrivacyModuleService;

  @tracked serverLocationSettings: PrivacyServerLocationSettingsModel | null =
    null;
  @tracked customCountriesList: string[] = [];
  @tracked defaultCountriesList: GeoSettingItem[] = [];

  @tracked originalCustomCountries: string[] = [];
  @tracked originalDefaultCountries: GeoSettingItem[] = [];

  @tracked searchQuery = '';
  @tracked allCountryMap: Record<string, string> = {};

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.loadCountries.perform();

    this.fetchServerLocationSettings.perform();
  }

  get disableSaveButton() {
    return Object.keys(this.privacyModule.updatedSettings).length === 0;
  }

  get defaultCountryCodes() {
    return this.defaultCountriesList.map((item: GeoSettingItem) =>
      item.settings_parameter.replace('geo_', '').toUpperCase()
    );
  }

  get countryOptions(): CountryOption[] {
    const excluded = new Set([
      ...this.customCountriesList,
      ...this.defaultCountryCodes,
    ]);

    return Object.entries(this.allCountryMap)
      .filter(([key]) => !excluded.has(key))
      .map(([key, value]) => ({ label: value, value: key }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  @action
  handleChange(value: string) {
    this.searchQuery = value;
  }

  @action
  handleSelect(option: CountryOption) {
    this.customCountriesList = [...this.customCountriesList, option.value];
    this.setUpdatedSetting('geo_custom_countries', this.customCountriesList);

    this.searchQuery = '';
  }

  @action
  handleCountryDelete(index: number) {
    const updated = this.customCountriesList.filter((_, i) => i !== index);
    this.customCountriesList = updated;

    const isReverted =
      updated.length === this.originalCustomCountries.length &&
      updated.every((v, i) => v === this.originalCustomCountries[i]);

    if (isReverted) {
      this.removeUpdatedSetting('geo_custom_countries');
    } else {
      this.setUpdatedSetting('geo_custom_countries', updated);
    }
  }

  @action
  toggleGeoItem(key: string, _event: Event, checked?: boolean) {
    if (key in this.privacyModule.updatedSettings) {
      this.removeUpdatedSetting(key);
    } else {
      this.setUpdatedSetting(key, checked);
    }
  }

  @action
  handleCancel() {
    // restore custom
    this.customCountriesList = [...this.originalCustomCountries];

    // restore default
    this.defaultCountriesList = this.originalDefaultCountries.map((item) => ({
      ...item,
    }));

    this.privacyModule.updatedSettings = {};

    this.searchQuery = '';
  }

  @action
  syncOriginalState() {
    this.originalCustomCountries = [...this.customCountriesList];

    this.originalDefaultCountries = this.defaultCountriesList.map(
      (item: GeoSettingItem) => ({ ...item })
    );
  }

  private setUpdatedSetting<K extends keyof PrivacySettingsUpdatePayload>(
    key: K,
    value: PrivacySettingsUpdatePayload[K]
  ) {
    this.privacyModule.updatedSettings = {
      ...this.privacyModule.updatedSettings,
      [key]: value,
    };
  }

  private removeUpdatedSetting(key: string) {
    const updated = { ...this.privacyModule.updatedSettings };
    delete updated[key];
    this.privacyModule.updatedSettings = updated;
  }

  fetchServerLocationSettings = task(async () => {
    try {
      this.serverLocationSettings = await this.store.queryRecord(
        'privacy-server-location-settings',
        {}
      );

      this.customCountriesList =
        this.serverLocationSettings?.customCountries ?? [];

      this.defaultCountriesList = this.serverLocationSettings.geoSettings.map(
        (item: GeoSettingItem) => {
          const code = item.settings_parameter
            .replace('geo_', '')
            .toUpperCase();

          const name = this.allCountryMap?.[code] || item.settings_parameter;

          return {
            ...item,
            countryName: name,
          };
        }
      );

      this.syncOriginalState();
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });

  loadCountries = task(async () => {
    const response = await fetch('/world.json');
    const data = await response.json();
    const countryMap: Record<string, string> = {};

    data.features.forEach((item: WorldFeature) => {
      const code = item.properties?.name;
      const name = item.properties?.countryName;

      if (code && name) {
        countryMap[code] = name;
      }
    });

    this.allCountryMap = countryMap;
  });

  saveSettings = task(async () => {
    try {
      if (this.serverLocationSettings) {
        await this.serverLocationSettings.saveServerLocationSettings(
          this.serverLocationSettings.id,
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
    'PrivacyModule::Settings::ServerLocation': typeof PrivacyModuleSettingsServerLocationComponent;
    'privacy-module/settings/server-location': typeof PrivacyModuleSettingsServerLocationComponent;
  }
}
