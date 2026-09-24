import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import type IntlService from 'ember-intl/services/intl';

export interface ProjectSettingsApiScanAutomationSettingsRuleListSignature {
  Args: {
    label: string;
    description: string;
    placeholder: string;
    items: string[];
    disabled?: boolean;
    testId: string;
    /** Returns a translated error message, or null when the entry is valid. */
    validate: (value: string) => string | null;
    onChange: (items: string[]) => void;
  };
}

/**
 * Add/remove list of scope rules for API scan automation.
 *
 * Purely presentational - the owning component holds the values and decides
 * when they are persisted.
 */
export default class ProjectSettingsApiScanAutomationSettingsRuleListComponent extends Component<ProjectSettingsApiScanAutomationSettingsRuleListSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked newEntry = '';

  get items() {
    return this.args.items || [];
  }

  get hasItems() {
    return !isEmpty(this.items);
  }

  @action
  updateNewEntry(event: Event) {
    this.newEntry = (event.target as HTMLInputElement).value;
  }

  @action
  addEntry() {
    const entry = this.newEntry.trim();

    if (isEmpty(entry)) {
      return this.notify.error(this.intl.t('apiScanAutomation.emptyRule'));
    }

    const error = this.args.validate(entry);

    if (error) {
      return this.notify.error(error);
    }

    if (this.items.includes(entry)) {
      return this.notify.error(this.intl.t('apiScanAutomation.duplicateRule'));
    }

    this.args.onChange([...this.items, entry]);
    this.newEntry = '';
  }

  @action
  removeEntry(entry: string) {
    this.args.onChange(this.items.filter((item) => item !== entry));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ApiScanAutomation::Settings::RuleList': typeof ProjectSettingsApiScanAutomationSettingsRuleListComponent;
  }
}
