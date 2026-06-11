import { service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type DsNavigationGraphModel from 'irene/models/ds-navigation-graph';
import type FileModel from 'irene/models/file';

export interface DsNavigationGraphRouteModel {
  navigationGraph: DsNavigationGraphModel | null;
  file: FileModel;
  dynamicscanId: string;
}

export default class AuthenticatedDashboardDsNavigationGraphRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model(params: {
    dynamicscan_id: string;
  }): Promise<DsNavigationGraphRouteModel> {
    const adapter = this.store.adapterFor('ds-navigation-graph');
    adapter.setNestedUrlNamespace(params.dynamicscan_id);

    const navigationGraph = await this.store.queryRecord(
      'ds-navigation-graph',
      {}
    );

    const dynamicscan = await this.store.findRecord(
      'dynamicscan',
      params.dynamicscan_id
    );

    const file = await dynamicscan.file;

    return {
      navigationGraph,
      file,
      dynamicscanId: params.dynamicscan_id,
    };
  }
}
