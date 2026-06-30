import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

export default class StoreReleaseReadinessUpsellingComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked hasContactedSupport = false;

  CONTACT_SUPPORT_ENDPOINT = 'v2/feature_request/store_release_readiness';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem(
      'storeReleaseReadinessRequest'
    );

    this.hasContactedSupport = storedState === 'true';
  }

  get features() {
    return [
      this.intl.t('storeReleaseReadiness.features.1'),
      this.intl.t('storeReleaseReadiness.features.2'),
      this.intl.t('storeReleaseReadiness.features.3'),
    ];
  }

  @action
  onClickContactCTA() {
    this.contactSupport.perform();
  }

  contactSupport = task(async () => {
    try {
      await waitForPromise(this.ajax.post(this.CONTACT_SUPPORT_ENDPOINT));

      this.window.localStorage.setItem('storeReleaseReadinessRequest', 'true');

      this.hasContactedSupport = true;

      this.analytics.track({
        name: 'FEATURE_REQUEST_EVENT',
        properties: {
          feature: 'store_release_readiness',
        },
      });
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::Upselling': typeof StoreReleaseReadinessUpsellingComponent;
  }
}
