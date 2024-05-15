import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import ENV from 'irene/config/environment';

export default class SecurityPurgeApiAnalysisComponent extends Component {
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service declare ajax: any;

  @tracked fileNumber = '';

  get isPurgingAPIAnalyses() {
    return this.purgeAPIAnalyses.isRunning;
  }

  purgeAPIAnalyses = task(async () => {
    const fileId = this.fileNumber;

    const url = [
      ENV.endpoints['files'],
      fileId,
      ENV.endpoints['purgeAPIAnalyses'],
    ].join('/');

    try {
      await this.ajax.post(url, { namespace: 'api/hudson-api' });

      this.notify.success('Successfully Purged the Analysis');
      this.fileNumber = '';
    } catch (err) {
      const error = err as AdapterError;
      let errMsg = this.intl.t('tPleaseTryAgain');

      if (error.errors && error.errors.length) {
        errMsg = error.errors[0]?.detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::PurgeApiAnalysis': typeof SecurityPurgeApiAnalysisComponent;
  }
}
