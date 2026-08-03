import { service } from '@ember/service';
import type Store from 'ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import { NavigationGraphRouteError } from 'irene/routes/authenticated/dashboard/ds-navigation-graph-error';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import parseError from 'irene/utils/parse-error';
import type DsNavigationGraphModel from 'irene/models/ds-navigation-graph';
import type FileModel from 'irene/models/file';
import type LoggerService from 'irene/services/logger';

export interface DsNavigationGraphRouteModel {
  navigationGraph: DsNavigationGraphModel | null;
  file: FileModel;
  dynamicscanId: string;
}

interface NavigationGraphRouteParams {
  fileid: string;
  dynamicscan_id: string;
}

export default class AuthenticatedDashboardDsNavigationGraphRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare logger: LoggerService;

  NAV_GRAPH_MODEL = 'ds-navigation-graph' as const;

  private async recordQueryErrorWrapper<T>(
    fileId: string,
    isFileValid: boolean,
    queryFn: () => Promise<T>
  ) {
    try {
      return await queryFn();
    } catch (error) {
      this.logger.error(parseError(error));
      throw new NavigationGraphRouteError({ isFileValid, fileId });
    }
  }

  private async getNavigationGraph(dynamicscanId: string) {
    const adapter = this.store.adapterFor(this.NAV_GRAPH_MODEL);
    adapter.setNestedUrlNamespace(dynamicscanId);

    return this.store.queryRecord(this.NAV_GRAPH_MODEL, {});
  }

  async model(params: NavigationGraphRouteParams) {
    const { fileid: fileId, dynamicscan_id: dynamicscanId } = params;

    const file = await this.recordQueryErrorWrapper(fileId, false, () =>
      this.store.findRecord('file', fileId)
    );

    const navigationGraph = await this.recordQueryErrorWrapper(
      fileId,
      true,
      () => this.getNavigationGraph(dynamicscanId)
    );

    return { navigationGraph, file, dynamicscanId };
  }
}
