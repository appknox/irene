import Controller from '@ember/controller';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedReportsPreviewController extends Controller {
  get breadcrumbs(): AkBreadcrumbsItemProps {
    const crumb: AkBreadcrumbsItemProps = {
      title: 'Report Generated',
      route: 'authenticated.reports.preview',
      routeGroup: 'ai-reporting',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: 'AI Generate Engine',
      route: 'authenticated.reports.generate',
      routeGroup: 'ai-reporting',
    };

    return {
      ...crumb,
      parentCrumb,
    };
  }
}
