import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedReportsGenerateController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('reportModule.aiGenerateEngine'),
      route: 'authenticated.reports.generate',
      routeGroup: 'ai-reporting',
      isRootCrumb: true,
    };

    return crumb;
  }
}
