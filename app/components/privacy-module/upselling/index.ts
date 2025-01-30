import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';

export default class PrivacyModuleUpsellingComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked hasContactedSupport = false;

  CONTACT_SUPPORT_ENDPOINT = 'v2/feature_request/privacy_module';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('privacyRequest');

    this.hasContactedSupport = storedState === 'true';
  }

  get features() {
    return [
      this.intl.t('privacyModule.features.trackers', {
        htmlSafe: true,
      }),
      this.intl.t('privacyModule.features.dangPerms', {
        htmlSafe: true,
      }),
      this.intl.t('privacyModule.features.pii', {
        htmlSafe: true,
      }),
      this.intl.t('privacyModule.features.geoLoc', {
        htmlSafe: true,
      }),
    ];
  }

  @action
  onClickContactCTA() {
    this.contactSupport.perform();
  }

  contactSupport = task(async () => {
    try {
      await waitForPromise(this.ajax.post(this.CONTACT_SUPPORT_ENDPOINT));

      this.window.localStorage.setItem('privacyRequest', 'true');

      this.hasContactedSupport = true;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::Upselling': typeof PrivacyModuleUpsellingComponent;
  }
}
