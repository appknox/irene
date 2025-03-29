import Controller from '@ember/controller';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedReportsGenerateController extends Controller {
  get breadcrumbs(): AkBreadcrumbsItemProps {
    const crumb: AkBreadcrumbsItemProps = {
      title: 'Report Generated',
      route: 'authenticated.reports.preview',
      routeGroup: 'ai-reporting',
      isRootCrumb: true,
    };

    return crumb;
  }
}
