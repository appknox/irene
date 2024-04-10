import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import UserModel from 'irene/models/user';
import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';

type AjaxError = { status: number };

export default class AuthenticatedOrganizationSettingsRoute extends Route {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service ajax!: any;

  beforeModel(): void {
    if (!this.me.org?.get('is_admin')) {
      this.router.transitionTo(
        'authenticated.dashboard.organization.namespaces'
      );
    }
  }

  async model() {
    const url = `/api/organizations/${this.organization.selected?.id}/github`;
    let integratedUser: unknown | null = null;
    let reconnect = false;

    try {
      const data = await this.ajax.request(url);

      if (data) {
        integratedUser = data;
      }
    } catch (err) {
      if ((err as AjaxError).status === 400) {
        reconnect = true;
      }
    }

    await this.store.query('organization', { id: null });

    return {
      integratedUser,
      reconnect,
      user: (await this.modelFor('authenticated')) as UserModel,
      organization: await this.organization.selected,
      me: this.me,
    };
  }
}
