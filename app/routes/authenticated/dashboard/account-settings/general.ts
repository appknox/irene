import Route from '@ember/routing/route';

import type UserModel from 'irene/models/user';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedSettingsGeneralRoute extends ScrollToTop(
  Route
) {
  model() {
    return this.modelFor(
      'authenticated.dashboard.account-settings'
    ) as UserModel;
  }
}
