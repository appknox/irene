import Component from '@glimmer/component';
import { StoreknoxDiscoveryRequestedQueryParam } from 'irene/routes/authenticated/storeknox/discover/requested';

export interface StoreknoxDiscoverRequestedAppsSignature {
  Args: {
    queryParams: StoreknoxDiscoveryRequestedQueryParam;
  };
}

export default class StoreknoxDiscoverRequestedAppsComponent extends Component<StoreknoxDiscoveryRequestedQueryParam> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::RequestedApps': typeof StoreknoxDiscoverRequestedAppsComponent;
  }
}
