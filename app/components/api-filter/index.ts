import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { tracked } from '@glimmer/tracking';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ApiScanOptionsModel from 'irene/models/api-scan-options';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

const isRegexFailed = function (url: string) {
  const reg =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;
  return reg.test(url);
};

export interface ApiFilterSignature {
  Args: {
    profileId?: string;
    hideDescriptionText?: boolean;
  };
  Blocks: {
    title: [];
  };
}

export default class ApiFilterComponent extends Component<ApiFilterSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked newUrlFilter = '';
  @tracked deletedURL = '';
  @tracked updatedURLFilters: string[] = [];
  @tracked showRemoveURLConfirmBox = false;
  @tracked apiScanOptions?: ApiScanOptionsModel;

  constructor(owner: unknown, args: ApiFilterSignature['Args']) {
    super(owner, args);

    this.fetchApiScanOptions.perform();
  }

  get columns() {
    return [
      { name: this.intl.t('apiURLFilter'), valuePath: 'url', width: 350 },
      {
        name: this.intl.t('action'),
        component: 'api-filter/action',
        textAlign: 'center',
        width: 60,
      },
    ];
  }

  get apiUrlFilters() {
    return (this.apiScanOptions?.dsApiCaptureFilters || []).map((url) => ({
      url,
    }));
  }

  fetchApiScanOptions = task(async () => {
    this.apiScanOptions = await this.store.queryRecord('api-scan-options', {
      id: this.args.profileId,
    });
  });

  @action
  openRemoveURLConfirmBox(url: string) {
    this.deletedURL = url;
    this.showRemoveURLConfirmBox = true;
  }

  @action
  closeRemoveURLConfirmBox() {
    this.deletedURL = '';
    this.showRemoveURLConfirmBox = false;
  }

  @action
  confirmCallback() {
    const currentURLs = this.apiScanOptions?.dsApiCaptureFilters;

    if (currentURLs) {
      this.updatedURLFilters = currentURLs.filter(
        (it) => it !== this.deletedURL
      );

      this.saveApiUrlFilter.perform();
    }
  }

  saveApiUrlFilter = task(async () => {
    try {
      const url = [
        ENV.endpoints['profiles'],
        this.args.profileId,
        ENV.endpoints['apiScanOptions'],
      ].join('/');

      const data = {
        ds_api_capture_filters: this.updatedURLFilters,
      };

      triggerAnalytics(
        'feature',
        ENV.csb['addAPIEndpoints'] as CsbAnalyticsFeatureData
      );

      await this.ajax.put(url, { data });

      this.notify.success(this.intl.t('urlUpdated'));

      if (!this.isDestroyed) {
        this.closeRemoveURLConfirmBox();

        this.apiScanOptions?.set('dsApiCaptureFilters', this.updatedURLFilters);

        this.newUrlFilter = '';
      }
    } catch (error) {
      if (!this.isDestroyed) {
        this.notify.error((error as AjaxError).payload.message);
      }
    }
  });

  @action
  addApiUrlFilter() {
    if (isEmpty(this.newUrlFilter)) {
      return this.notify.error(this.intl.t('emptyURLFilter'));
    } else {
      if (!isRegexFailed(this.newUrlFilter)) {
        return this.notify.error(
          `${this.newUrlFilter} ${this.intl.t('invalidURL')}`
        );
      }

      if (this.apiUrlFilters.some((it) => it.url === this.newUrlFilter)) {
        return this.notify.error(this.intl.t('urlAlreadyExists'));
      }
    }

    const apiUrlFilters = this.apiScanOptions?.dsApiCaptureFilters;

    const combinedURLS =
      apiUrlFilters && !isEmpty(apiUrlFilters)
        ? [...apiUrlFilters, this.newUrlFilter]
        : [this.newUrlFilter];

    this.updatedURLFilters = combinedURLS;

    this.saveApiUrlFilter.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ApiFilter: typeof ApiFilterComponent;
  }
}
