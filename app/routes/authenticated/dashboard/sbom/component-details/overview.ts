import Route from '@ember/routing/route';

import type SbomComponentModel from 'irene/models/sbom-component';

export default class ComponentDetailsOverviewRoute extends Route {
  model() {
    return this.modelFor(
      'authenticated.dashboard.sbom.component-details'
    ) as SbomComponentModel;
  }
}
