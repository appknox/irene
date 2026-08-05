import Component from '@glimmer/component';
import { action } from '@ember/object';
import { runTask } from 'ember-lifeline';
import { getTimeZones } from '@vvo/tzdb';

import type { Select } from 'ember-power-select/components/power-select';
import type DsAutomatedScanWindowPreferenceModel from 'irene/models/ds-automated-scan-window-preference';

const MAX_LABEL_CHARS = 38;
const MAX_REGION_CHARS = 14;
const MAX_CITY_CHARS = 6;

export interface ScanWindowTimezoneOption {
  label: string;
  truncatedLabel: string;
  value: string;
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}...` : s;
}

/**
 * Formats the offset from UTC in the format `+00:00` or `-00:00`.
 * @param minutes - The offset in minutes.
 * @returns The formatted offset.
 */

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;

  return `${sign}${hours}:${String(mins).padStart(2, '0')}`;
}

// Module-level cache: getTimeZones() returns ~400 entries and is pure.
let _cachedTimezoneOptions: ScanWindowTimezoneOption[] | null = null;

function getTimezoneOptions(): ScanWindowTimezoneOption[] {
  if (_cachedTimezoneOptions) {
    return _cachedTimezoneOptions;
  }

  _cachedTimezoneOptions = getTimeZones().map((tz) => {
    const offset = `(GMT${formatOffset(tz.currentTimeOffsetInMinutes)})`;
    const city = tz.mainCities?.[0];
    const region = tz.alternativeName;
    const fullMiddle = city ? `${region} – ${city}` : region;
    const label = `${fullMiddle} ${offset}`;

    let truncatedLabel = label;

    if (label.length > MAX_LABEL_CHARS) {
      const truncMiddle = city
        ? `${truncate(region, MAX_REGION_CHARS)} – ${truncate(city, MAX_CITY_CHARS)}`
        : truncate(region, MAX_REGION_CHARS);

      truncatedLabel = `${truncMiddle} ${offset}`;
    }

    return { label, truncatedLabel, value: tz.name };
  });

  return _cachedTimezoneOptions;
}

interface ProjectSettingsDastAutomationAutomationSettingsScanWindowTimezoneSelectSignature {
  Args: {
    preference: DsAutomatedScanWindowPreferenceModel;
    disabled?: boolean;
    onSave: () => void;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsScanWindowTimezoneSelectComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsScanWindowTimezoneSelectSignature> {
  get timezoneOptions() {
    return getTimezoneOptions();
  }

  get selectedTimezoneOption() {
    return this.timezoneOptions.find(
      (o) => o.value === this.args.preference.scanWindowTimezone
    );
  }

  @action
  handleTimezoneChange(option: ScanWindowTimezoneOption) {
    this.args.preference.scanWindowTimezone = option.value;
    this.args.onSave();
  }

  @action
  handleOpen(select: Select): boolean | undefined {
    const option = this.selectedTimezoneOption;

    // Return undefined to let PowerSelect handle the scroll-to-selected.
    if (!option) {
      return undefined;
    }

    runTask(this, () => {
      select.actions.scrollTo?.(option);
    });

    return undefined;
  }

  @action
  searchTimezone(term: string) {
    if (!term) {
      return this.timezoneOptions;
    }

    const lower = term.toLowerCase();

    return this.timezoneOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        o.value.toLowerCase().includes(lower)
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScanWindow::TimezoneSelect': typeof ProjectSettingsDastAutomationAutomationSettingsScanWindowTimezoneSelectComponent;
  }
}
