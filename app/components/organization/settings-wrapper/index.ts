import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationModel from 'irene/models/organization';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export interface OrganizationSettingsWrapperSignature {
  Args: {
    organization: OrganizationModel;
  };
  Blocks: {
    default: [];
  };
}

export default class OrganizationSettingsWrapperComponent extends Component<OrganizationSettingsWrapperSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.organization.namespaces',
        linkTitle: this.intl.t('organization'),
      },
      {
        route: 'authenticated.dashboard.organization-settings',
        linkTitle: this.intl.t('settings'),
      },
    ];
  }

  get isPublicApiEnabled() {
    return this.organization.selected?.features?.public_apis;
  }

  get isOwnerOrAdmin() {
    return this.me.org?.get('is_owner') || this.me.org?.get('is_admin');
  }

  get tabItems() {
    return [
      {
        id: 'organization-settings',
        label: this.intl.t('organizationSettings'),
        route: 'authenticated.dashboard.organization-settings.index',
        currentWhen: 'authenticated.dashboard.organization-settings.index',
      },
      this.isPublicApiEnabled && this.isOwnerOrAdmin
        ? {
            id: 'service-account',
            label: 'Service Account',
            route:
              'authenticated.dashboard.organization-settings.service-account',
            currentWhen:
              'authenticated.dashboard.organization-settings.service-account',
          }
        : null,
    ].filter(Boolean);
  }

  get showOrgNameActionBtn() {
    return (
      this.args.organization.name !== '' && this.me.get('org')?.get('is_owner')
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SettingsWrapper': typeof OrganizationSettingsWrapperComponent;
  }
}
