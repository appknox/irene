import Route from '@ember/routing/route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type UserModel from 'irene/models/user';

export default class AuthenticatedSettingsNotificationSettingsRoute extends ScrollToTop(
  Route
) {
  model() {
    return this.modelFor(
      'authenticated.dashboard.account-settings'
    ) as UserModel;
  }
}
