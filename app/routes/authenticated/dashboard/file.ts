import Route from '@ember/routing/route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedDashboardFileRoute extends ScrollToTop(
  Route
) {}
