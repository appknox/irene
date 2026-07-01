import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type DsAutomatedScanWindowPreferenceModel from 'irene/models/ds-automated-scan-window-preference';
import type { DsAutomatedScanWindowType } from 'irene/models/ds-automated-scan-window-preference';

const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '18:00';
const DEFAULT_TIMEZONE = 'Europe/London';

interface ScanWindowTypeOption {
  label: string;
  value: DsAutomatedScanWindowType;
}

interface ProjectSettingsDastAutomationAutomationSettingsScanWindowSignature {
  Args: {
    profileId?: string | number;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsScanWindowComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsScanWindowSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked preference: DsAutomatedScanWindowPreferenceModel | null = null;
  @tracked scanWindowTypeOptions: ScanWindowTypeOption[];

  constructor(
    owner: unknown,
    args: ProjectSettingsDastAutomationAutomationSettingsScanWindowSignature['Args']
  ) {
    super(owner, args);

    this.scanWindowTypeOptions = [
      {
        label: this.intl.t('dastAutomation.scanWindowAnytime'),
        value: 'anytime',
      },
      {
        label: this.intl.t('dastAutomation.scanWindowSpecificTime'),
        value: 'specific_time',
      },
    ];

    this.loadPreference.perform();
  }

  get selectedTypeOption() {
    return this.scanWindowTypeOptions.find(
      (op) => op.value === this.preference?.scanWindowType
    );
  }

  get isSpecificTime() {
    return this.preference?.scanWindowType === 'specific_time';
  }

  @action
  handleTypeChange(option: ScanWindowTypeOption) {
    if (!this.preference || option.value === this.preference.scanWindowType) {
      return;
    }

    this.preference.scanWindowType = option.value;

    // Specific time requires non-null start/end/timezone — seed defaults the
    // first time the user flips the switch so the PUT doesn't 400 on
    // "This field may not be null."
    if (option.value === 'specific_time') {
      if (!this.preference.scanWindowStartAt) {
        this.preference.scanWindowStartAt = DEFAULT_START_TIME;
      }

      if (!this.preference.scanWindowEndBefore) {
        this.preference.scanWindowEndBefore = DEFAULT_END_TIME;
      }

      if (!this.preference.scanWindowTimezone) {
        this.preference.scanWindowTimezone = DEFAULT_TIMEZONE;
      }
    } else {
      this.preference.scanWindowStartAt = null;
      this.preference.scanWindowEndBefore = null;
      this.preference.scanWindowTimezone = '';
    }

    this.savePreference.perform();
  }

  // Exposed to sub-components via `@onSave` — they mutate `preference`
  // attributes and call this to fire the PUT.
  @action
  triggerSave() {
    this.savePreference.perform();
  }

  private prepAdapter() {
    const adapter = this.store.adapterFor(
      'ds-automated-scan-window-preference'
    );

    adapter.setNestedUrlNamespace(String(this.args.profileId));
  }

  loadPreference = task(async () => {
    if (!this.args.profileId) {
      return;
    }

    try {
      this.prepAdapter();

      this.preference = await this.store.queryRecord(
        'ds-automated-scan-window-preference',
        {}
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  savePreference = task(async () => {
    if (!this.preference) {
      return;
    }

    try {
      this.prepAdapter();
      await this.preference.save();

      this.notify.success(this.intl.t('dastAutomation.scanWindowUpdated'));
    } catch (err) {
      this.preference.rollbackAttributes();
      this.notify.error(parseError(err, this.intl.t('somethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScanWindow': typeof ProjectSettingsDastAutomationAutomationSettingsScanWindowComponent;
  }
}
