import Component from '@glimmer/component';
import { action } from '@ember/object';
import { debounceTask } from 'ember-lifeline';

import type DsAutomatedScanWindowPreferenceModel from 'irene/models/ds-automated-scan-window-preference';

const TIME_SAVE_DEBOUNCE_MS = 1000;

// Represents one of the two time fields (start / end).
interface ScanWindowTimeField {
  preferenceKey: 'scanWindowStartAt' | 'scanWindowEndBefore';
  inputEl: HTMLInputElement | null;
  pickerActive: boolean;
}

interface ProjectSettingsDastAutomationAutomationSettingsScanWindowTimeRangeSignature {
  Args: {
    preference: DsAutomatedScanWindowPreferenceModel;
    disabled?: boolean;
    onSave: () => void;
  };
}

export default class ProjectSettingsDastAutomationAutomationSettingsScanWindowTimeRangeComponent extends Component<ProjectSettingsDastAutomationAutomationSettingsScanWindowTimeRangeSignature> {
  private readonly timeFields: Record<'start' | 'end', ScanWindowTimeField> = {
    start: {
      preferenceKey: 'scanWindowStartAt',
      inputEl: null,
      pickerActive: false,
    },
    end: {
      preferenceKey: 'scanWindowEndBefore',
      inputEl: null,
      pickerActive: false,
    },
  };

  @action
  registerStartInput(el: HTMLInputElement) {
    this.timeFields.start.inputEl = el;
  }

  @action
  registerEndInput(el: HTMLInputElement) {
    this.timeFields.end.inputEl = el;
  }

  @action
  openStartPicker() {
    this.openPicker('start');
  }

  @action
  openEndPicker() {
    this.openPicker('end');
  }

  @action
  handleStartTimeChange(event: Event) {
    this.handleTimeChange('start', event);
  }

  @action
  handleEndTimeChange(event: Event) {
    this.handleTimeChange('end', event);
  }

  private openPicker(key: 'start' | 'end') {
    const field = this.timeFields[key];

    field.pickerActive = true;

    field.inputEl?.addEventListener(
      'cancel',
      () => (field.pickerActive = false),
      { once: true }
    );

    field.inputEl?.showPicker?.();
  }

  private handleTimeChange(key: 'start' | 'end', event: Event) {
    const field = this.timeFields[key];
    const target = event.target as HTMLInputElement;

    this.args.preference[field.preferenceKey] = target.value;

    if (field.pickerActive) {
      field.pickerActive = false;
      this.args.onSave();
    } else {
      // Debounce typing-driven saves; picker-driven saves are immediate above.
      debounceTask(this, 'debouncedSave', TIME_SAVE_DEBOUNCE_MS);
    }
  }

  // Resolved by string from debounceTask; not invoked from templates so no
  // @action decorator is needed.
  debouncedSave() {
    this.args.onSave();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScanWindow::TimeRange': typeof ProjectSettingsDastAutomationAutomationSettingsScanWindowTimeRangeComponent;
  }
}
