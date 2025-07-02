import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type IreneAjaxService from './ajax';
import type SkOrganizationModel from 'irene/models/sk-organization';
import type SkOrganizationSubModel from 'irene/models/sk-organization-sub';

export default class SkOrganizationService extends Service {
  @service declare store: Store;
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;

  @service('notifications') declare notify: NotificationService;

  @tracked selected: SkOrganizationModel | null = null;
  @tracked selectedSkOrgSub: SkOrganizationSubModel | null = null;

  async fetchOrganization() {
    const skOrganizations = await this.store.findAll('sk-organization');
    const selectedSkOrg = skOrganizations.slice()[0];

    if (selectedSkOrg) {
      this.selected = selectedSkOrg;
    } else {
      this.notify.error(
        this.intl.t('storeknox.noSkOrgSupportMsg'),
        ENV.notifications
      );
    }
  }

  async fetchSkOrgSub() {
    try {
      const skOrgSubAdapter = this.store.adapterFor('sk-organization-sub');
      skOrgSubAdapter.setNestedUrlNamespace(String(this.selected?.id));

      this.selectedSkOrgSub = await this.store.queryRecord(
        'sk-organization-sub',
        {}
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  }

  async reloadOrgSub() {
    await this.fetchSkOrgSub();

    return this.selectedSkOrgSub;
  }

  async load() {
    await this.fetchOrganization();
    await this.fetchSkOrgSub();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sk-organization': SkOrganizationService;
  }
}
