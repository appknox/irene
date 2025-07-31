import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Transition from '@ember/routing/transition';
import type RouterService from '@ember/routing/router-service';

import type OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';
import type IntlService from 'ember-intl/services/intl';

type SlackResponse = {
  api_token: string;
  channel_id: string;
};

export default class AuthenticatedSlackRedirectRoute extends Route {
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  async beforeModel(transition: Transition) {
    const token = encodeURIComponent(
      transition.to?.queryParams['token'] as string
    );

    const url = `/api/organizations/${this.organization.selected?.id}/slack`;

    try {
      await this.ajax.post<SlackResponse>(url, {
        data: { token },
      });

      this.notify.success(this.intl.t('slack.successfullyIntegrated'));
    } catch (err) {
      const error = (err as AjaxError).payload.message;
      // If the error is a 400, it means the token is invalid or the user has no access
      if ((err as AjaxError).status === 400) {
        this.notify.error(this.intl.t('slack.invalidToken'));
      } else {
        this.notify.error(error ? `${error}` : this.intl.t('pleaseTryAgain'));
      }
    }
  }

  async afterModel() {
    return this.router.transitionTo(
      'authenticated.dashboard.organization-settings.integrations'
    );
  }
}
