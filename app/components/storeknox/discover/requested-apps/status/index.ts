import Component from '@glimmer/component';
import dayjs from 'dayjs';

import SkRequestedAppModel from 'irene/models/sk-requested-app';

export interface StoreknoxDiscoverRequestedAppsStatusSignature {
  Args: {
    data: SkRequestedAppModel;
  };
}

export default class StoreknoxDiscoverRequestedAppsStatusComponent extends Component<StoreknoxDiscoverRequestedAppsStatusSignature> {
  get approvedOn() {
    return dayjs(this.args.data.approvedOn).format('MMMM D, YYYY, HH:mm');
  }

  get rejectedOn() {
    return dayjs(this.args.data.rejectedOn).format('MMMM D, YYYY, HH:mm');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::RequestedApps::Status': typeof StoreknoxDiscoverRequestedAppsStatusComponent;
  }
}
