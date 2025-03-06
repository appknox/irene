import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';

export default class SbomUpsellingComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked hasContactedSupport = false;

  CONTACT_SUPPORT_ENDPOINT = 'v2/feature_request/sbom';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('sbomRequest');

    this.hasContactedSupport = storedState === 'true';
  }

  get features() {
    return [
      this.intl.t('sbomModule.sbomFeatures.oneClickAnalysis'),
      this.intl.t('sbomModule.sbomFeatures.identifyDependencies'),
      this.intl.t('sbomModule.sbomFeatures.uncoverVulnerabilities'),
      this.intl.t('sbomModule.sbomFeatures.componentInsights'),
    ];
  }

  @action
  onClickContactCTA() {
    this.contactSupport.perform();
  }

  contactSupport = task(async () => {
    try {
      await waitForPromise(this.ajax.post(this.CONTACT_SUPPORT_ENDPOINT));

      this.window.localStorage.setItem('sbomRequest', 'true');

      this.hasContactedSupport = true;
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::Upselling': typeof SbomUpsellingComponent;
  }
}
