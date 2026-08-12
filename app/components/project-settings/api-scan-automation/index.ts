import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type NotificationService from 'irene/services/notifications';
import type ApiScanOptionsModel from 'irene/models/api-scan-options';
import type Store from 'ember-data/store';

interface Signature {
  Args: { profileId: string };
}

export default class ApiScanAutomationComponent extends Component<Signature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @tracked options?: ApiScanOptionsModel;
  @tracked enabled = false;
  @tracked includeFilters = '';
  @tracked excludeFilters = '';

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);
    this.fetchOptions.perform();
  }

  fetchOptions = task(async () => {
    this.options = await this.store.queryRecord('api-scan-options', {
      id: this.args.profileId,
    });
    this.enabled = this.options.apiScanAutomationEnabled;
    this.includeFilters = (
      this.options.apiScanAutomationIncludeFilters || []
    ).join('\n');
    this.excludeFilters = (
      this.options.apiScanAutomationExcludeFilters || []
    ).join('\n');
  });

  get filters() {
    return (value: string) =>
      value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
  }

  @action updateEnabled(value: boolean) {
    this.enabled = value;
  }
  @action updateIncludes(event: InputEvent) {
    this.includeFilters = (event.target as HTMLInputElement).value;
  }
  @action updateExcludes(event: InputEvent) {
    this.excludeFilters = (event.target as HTMLInputElement).value;
  }

  save = task(async () => {
    const includes = this.filters(this.includeFilters);
    if (this.enabled && includes.length === 0) {
      this.notify.error(
        'Add at least one include rule before enabling automation.'
      );
      return;
    }
    const url = [
      ENV.endpoints.profiles,
      this.args.profileId,
      ENV.endpoints.apiScanOptions,
    ].join('/');
    await this.ajax.put(url, {
      data: {
        ds_api_capture_filters: this.options?.dsApiCaptureFilters || [],
        api_scan_automation_enabled: this.enabled,
        api_scan_automation_include_filters: includes,
        api_scan_automation_exclude_filters: this.filters(this.excludeFilters),
      },
    });
    this.options?.setProperties({
      apiScanAutomationEnabled: this.enabled,
      apiScanAutomationIncludeFilters: includes,
      apiScanAutomationExcludeFilters: this.filters(this.excludeFilters),
    });
    this.notify.success('API scan automation settings updated.');
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectSettingsApiScanAutomation: typeof ApiScanAutomationComponent;
  }
}
