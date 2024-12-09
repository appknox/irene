import Component from '@glimmer/component';
import dayjs from 'dayjs';

import SkAppModel from 'irene/models/sk-app';

interface StoreknoxDiscoverPendingReviewTableFoundBySignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverPendingReviewTableFoundByComponent extends Component<StoreknoxDiscoverPendingReviewTableFoundBySignature> {
  get addedOn() {
    return dayjs(this.args.data.addedOn).format('MMMM D, YYYY, HH:mm');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table::FoundBy': typeof StoreknoxDiscoverPendingReviewTableFoundByComponent;
  }
}
