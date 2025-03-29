import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { service } from '@ember/service';
import type ReportRequestModel from 'irene/models/report-request';
import type Store from '@ember-data/store';

export default class AuthenticatedReportsPreviewRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  async model(params: { id: string }): Promise<ReportRequestModel> {
    return await this.store.findRecord('report-request', params.id);
  }
}
