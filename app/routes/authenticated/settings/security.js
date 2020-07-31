import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../../mixins/scroll-top';

export default class AuthenticatedSettingsSecurityRoute extends ScrollTopMixin(Route) {
  model () {
    return this.modelFor('authenticated.settings');
  }
}
