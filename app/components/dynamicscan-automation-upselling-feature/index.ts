import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

export default class DyanmicscanAutomationUpsellingFeatureComponent extends Component {
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked requestedForUpgrade = false;

  UPGRADE_TO_AUTOMATED_DAST_ENDPOINT = 'v2/feature_request/automated_dast';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem(
      'automatedDastRequest'
    );

    this.requestedForUpgrade = storedState === 'true';
  }

  contactSupport = task(async () => {
    try {
      await waitForPromise(
        this.ajax.post(this.UPGRADE_TO_AUTOMATED_DAST_ENDPOINT)
      );

      this.window.localStorage.setItem('automatedDastRequest', 'true');

      this.requestedForUpgrade = true;

      this.analytics.track({
        name: 'FEATURE_REQUEST_EVENT',
        properties: {
          feature: 'automated_dast',
        },
      });
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    DynamicscanAutomationUpsellingFeature: typeof DyanmicscanAutomationUpsellingFeatureComponent;
  }
}
