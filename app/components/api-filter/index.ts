import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import ApiScanOptionsModel from 'irene/models/api-scan-options';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

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
  @service declare analytics: AnalyticsService;
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

      await this.ajax.put(url, { data });

      this.notify.success(this.intl.t('urlUpdated'));

      if (!this.isDestroyed) {
        this.closeRemoveURLConfirmBox();

        this.apiScanOptions?.set('dsApiCaptureFilters', this.updatedURLFilters);

        this.newUrlFilter = '';
      }

      this.analytics.track({
        name: 'API_URL_FILTER_UPDATE_EVENT',
        properties: {
          feature: 'update_api_url_filters',
          profileId: this.args.profileId,
          urlFilters: this.updatedURLFilters.join(','),
        },
      });
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
