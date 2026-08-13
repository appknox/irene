import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type ApiScanOptionsModel from 'irene/models/api-scan-options';
import type IreneAjaxService from 'irene/services/ajax';

/** Hostname, optionally with wildcards. Rejects schemes, paths and ports. */
const HOST_PATTERN =
  /^[a-zA-Z0-9*]([a-zA-Z0-9*-]*[a-zA-Z0-9*])?(\.[a-zA-Z0-9*]([a-zA-Z0-9*-]*[a-zA-Z0-9*])?)*$/;

export interface ProjectSettingsApiScanAutomationSettingsSignature {
  Args: {
    profileId?: string | number;
  };
}

export default class ProjectSettingsApiScanAutomationSettingsComponent extends Component<ProjectSettingsApiScanAutomationSettingsSignature> {
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked options?: ApiScanOptionsModel;
  @tracked enabled = false;
  @tracked includedDomains: string[] = [];
  @tracked excludedDomains: string[] = [];
  @tracked excludedEndpoints: string[] = [];

  constructor(
    owner: unknown,
    args: ProjectSettingsApiScanAutomationSettingsSignature['Args']
  ) {
    super(owner, args);

    this.fetchOptions.perform();
  }

  fetchOptions = task(async () => {
    try {
      this.options = await this.store.queryRecord('api-scan-options', {
        id: this.args.profileId,
      });

      this.enabled = this.options.apiScanAutomationEnabled;
      this.includedDomains =
        this.options.apiScanAutomationIncludedDomains || [];
      this.excludedDomains =
        this.options.apiScanAutomationExcludedDomains || [];
      this.excludedEndpoints =
        this.options.apiScanAutomationExcludedEndpoints || [];
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  /**
   * With no included domains every captured host is scanned, which is worth
   * surfacing since nobody reviews the list before the scan starts.
   */
  get scansEveryCapturedHost() {
    return this.enabled && this.includedDomains.length === 0;
  }

  @action
  validateDomain(value: string) {
    if (!HOST_PATTERN.test(value)) {
      return this.intl.t('apiScanAutomation.invalidDomain', { domain: value });
    }

    return null;
  }

  @action
  validateEndpoint(value: string) {
    if (!value.startsWith('/')) {
      return this.intl.t('apiScanAutomation.invalidEndpoint', { path: value });
    }

    return null;
  }

  /** Saving before the current settings have loaded would overwrite them. */
  get saveDisabled() {
    return this.fetchOptions.isRunning || !this.options || this.save.isRunning;
  }

  @action
  updateEnabled(_: Event, enabled?: boolean) {
    this.enabled = Boolean(enabled);
  }

  @action
  updateIncludedDomains(items: string[]) {
    this.includedDomains = items;
  }

  @action
  updateExcludedDomains(items: string[]) {
    this.excludedDomains = items;
  }

  @action
  updateExcludedEndpoints(items: string[]) {
    this.excludedEndpoints = items;
  }

  save = task(async () => {
    try {
      const url = [
        ENV.endpoints['profiles'],
        this.args.profileId,
        ENV.endpoints['apiScanOptions'],
      ].join('/');

      const data = {
        api_scan_automation_enabled: this.enabled,
        api_scan_automation_included_domains: this.includedDomains,
        api_scan_automation_excluded_domains: this.excludedDomains,
        api_scan_automation_excluded_endpoints: this.excludedEndpoints,
      };

      await this.ajax.put(url, { data });

      this.options?.setProperties({
        apiScanAutomationEnabled: this.enabled,
        apiScanAutomationIncludedDomains: this.includedDomains,
        apiScanAutomationExcludedDomains: this.excludedDomains,
        apiScanAutomationExcludedEndpoints: this.excludedEndpoints,
      });

      this.notify.success(this.intl.t('apiScanAutomation.settingsUpdated'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::ApiScanAutomation::Settings': typeof ProjectSettingsApiScanAutomationSettingsComponent;
  }
}
