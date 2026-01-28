import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { service } from '@ember/service';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import type AiReportingReportRequestModel from 'irene/models/ai-reporting/report-request';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedReportsPreviewRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare organization: OrganizationService;

  beforeModel() {
    if (!this.organization.selected?.aiFeatures?.reporting) {
      this.router.replaceWith('authenticated.reports.generate');
    }
  }

  async model(params: { id: string }): Promise<AiReportingReportRequestModel> {
    return await this.store.findRecord(
      'ai-reporting/report-request',
      params.id
    );
  }
}
