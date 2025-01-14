import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SubmissionModel from 'irene/models/submission';

interface StoreknoxInventoryDetailsAppDetailsVaResultsSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel;
    updateSubmissionModel(submission: SubmissionModel): void;
    submission?: SubmissionModel | null;
    uploadFailed?: boolean;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsVaResultsInitiateUploadComponent extends Component<StoreknoxInventoryDetailsAppDetailsVaResultsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  @action initiateAppUpload() {
    this.doInitiateAppUpload.perform();
  }

  doInitiateAppUpload = task(async () => {
    try {
      const res = await this.skInventoryApp?.iniiateAppUpload();

      const submission = await this.store.findRecord(
        'submission',
        Number(res?.id)
      );

      this.args.updateSubmissionModel(submission);

      await this.skInventoryApp?.reload();
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults::InitiateUpload': typeof StoreknoxInventoryDetailsAppDetailsVaResultsInitiateUploadComponent;
  }
}
