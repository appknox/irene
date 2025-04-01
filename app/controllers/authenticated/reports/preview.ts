import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedReportsPreviewController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('reportModule.reportGenerated'),
      route: 'authenticated.reports.preview',
      routeGroup: 'ai-reporting',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('reportModule.aiGenerateEngine'),
      route: 'authenticated.reports.generate',
      routeGroup: 'ai-reporting',
    };

    return {
      ...crumb,
      parentCrumb,
    };
  }
}
