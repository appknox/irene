import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type DsManualDevicePreferenceModel from 'irene/models/ds-manual-device-preference';
import type DsAutomatedDevicePreferenceModel from 'irene/models/ds-automated-device-preference';

export interface DsPreferenceContext {
  dsManualDevicePreference: DsManualDevicePreferenceModel | null;
  dsAutomatedDevicePreference: DsAutomatedDevicePreferenceModel | null;
  loadingDsManualDevicePref: boolean;
  loadingDsAutomatedDevicePref: boolean;
  updatingDsManualDevicePref: boolean;
  updatingDsAutomatedDevicePref: boolean;

  updateDsManualDevicePref: (
    devicePreference: DsManualDevicePreferenceModel
  ) => void;

  updateDsAutomatedDevicePref: (
    devicePreference: DsAutomatedDevicePreferenceModel
  ) => void;
}

interface DsPreferenceProviderSignature {
  Args: {
    file: FileModel;
    profileId: string;
  };
  Blocks: {
    default: [DsPreferenceContext];
  };
}

export default class DsPreferenceProviderComponent extends Component<DsPreferenceProviderSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked dsManualDevicePreference: DsManualDevicePreferenceModel | null =
    null;

  @tracked
  dsAutomatedDevicePreference: DsAutomatedDevicePreferenceModel | null = null;

  constructor(owner: unknown, args: DsPreferenceProviderSignature['Args']) {
    super(owner, args);

    this.fetchDsManualDevicePref.perform();
    this.fetchDsAutomatedDevicePref.perform();
  }

  @action
  handleUpdateDsManualDevicePreference(
    devicePreference: DsManualDevicePreferenceModel
  ) {
    this.updateDsManualDevicePreference.perform(devicePreference);
  }

  @action
  handleUpdateDsAutomatedDevicePreference(
    devicePreference: DsAutomatedDevicePreferenceModel
  ) {
    this.updateDsAutomatedDevicePreference.perform(devicePreference);
  }

  fetchDsManualDevicePref = task(async () => {
    try {
      const adapter = this.store.adapterFor('ds-manual-device-preference');
      adapter.setNestedUrlNamespace(this.args.profileId);

      this.dsManualDevicePreference = await this.store.queryRecord(
        'ds-manual-device-preference',
        {}
      );
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDsManualDevicePref'));
    }
  });

  fetchDsAutomatedDevicePref = task(async () => {
    try {
      const adapter = this.store.adapterFor('ds-automated-device-preference');
      adapter.setNestedUrlNamespace(this.args.profileId);

      this.dsAutomatedDevicePreference = await this.store.queryRecord(
        'ds-automated-device-preference',
        {}
      );
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingDsAutomatedDevicePref'));
    }
  });

  updateDsManualDevicePreference = task(
    async (devicePreference: DsManualDevicePreferenceModel) => {
      try {
        const adapter = this.store.adapterFor('ds-manual-device-preference');
        adapter.setNestedUrlNamespace(this.args.profileId);

        this.dsManualDevicePreference = await devicePreference.save();

        this.notify.success(this.intl.t('savedPreferences'));
      } catch (error) {
        devicePreference.rollbackAttributes();

        this.notify.error(this.intl.t('failedToUpdateDsManualDevicePref'));
      }
    }
  );

  updateDsAutomatedDevicePreference = task(
    async (devicePreference: DsAutomatedDevicePreferenceModel) => {
      try {
        const adapter = this.store.adapterFor('ds-automated-device-preference');
        adapter.setNestedUrlNamespace(this.args.profileId);

        this.dsAutomatedDevicePreference = await devicePreference.save();

        this.notify.success(this.intl.t('savedPreferences'));
      } catch (error) {
        devicePreference.rollbackAttributes();

        this.notify.error(this.intl.t('failedToUpdateDsAutomatedDevicePref'));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    DsPreferenceProvider: typeof DsPreferenceProviderComponent;
  }
}
