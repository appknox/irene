import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type PrivacyReportModel from 'irene/models/privacy-report';
import type IreneAjaxService from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

export default class FileReportDrawerPrivacyReportsSampleComponent extends Component {
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked hasContactedSupport = false;
  @tracked samplePrivacyReport: PrivacyReportModel | undefined;

  CONTACT_SUPPORT_ENDPOINT = 'v2/feature_request/privacy_module';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('privacyRequest');

    this.hasContactedSupport = storedState === 'true';

    this.fetchSampleReport.perform();
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  contactSupport = task(async () => {
    try {
      await waitForPromise(this.ajax.post(this.CONTACT_SUPPORT_ENDPOINT));

      this.window.localStorage.setItem('privacyRequest', 'true');

      this.hasContactedSupport = true;

      this.analytics.track({
        name: 'FEATURE_REQUEST_EVENT',
        properties: {
          feature: 'privacy_module',
        },
      });
    } catch (err) {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  fetchSampleReport = task(async () => {
    try {
      this.samplePrivacyReport = await waitForPromise(
        this.store.findRecord('privacy-report', 'sample')
      );
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });

  triggerSampleReportDownload = task(async () => {
    try {
      const data = await waitForPromise(
        (this.samplePrivacyReport as PrivacyReportModel).downloadReport()
      );

      const { url } = data || {};

      if (url) {
        this.window.open(url, '_blank');
      } else {
        this.notify.error(this.intl.t('downloadUrlNotFound'));
      }
    } catch (e) {
      this.notify.error(parseError(e, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::ReportDrawer::PrivacyReports::Sample': typeof FileReportDrawerPrivacyReportsSampleComponent;
  }
}
