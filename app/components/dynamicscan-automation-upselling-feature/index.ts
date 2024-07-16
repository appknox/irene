import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';

export default class DyanmicscanAutomationUpsellingFeatureComponent extends Component {
  @service declare ajax: any;
  @service declare intl: IntlService;
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
