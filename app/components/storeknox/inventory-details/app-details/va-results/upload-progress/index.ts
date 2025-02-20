import Component from '@glimmer/component';
import type SubmissionModel from 'irene/models/submission';

interface StoreknoxInventoryDetailsAppDetailsVaResultsSignature {
  Args: {
    submission?: SubmissionModel | null;
    uploadNotStarted: boolean;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsVaResultsUploadProgressComponent extends Component<StoreknoxInventoryDetailsAppDetailsVaResultsSignature> {
  get uploadCompleted() {
    return this.args.submission?.progress === 100;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults::UploadProgress': typeof StoreknoxInventoryDetailsAppDetailsVaResultsUploadProgressComponent;
  }
}
