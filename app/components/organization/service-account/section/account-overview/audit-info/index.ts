import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';

export interface OrganizationServiceAccountSectionAccountOverviewAuditInfoSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
  };
}

export default class OrganizationServiceAccountSectionAccountOverviewAuditInfoComponent extends Component<OrganizationServiceAccountSectionAccountOverviewAuditInfoSignature> {
  @service declare intl: IntlService;

  get moreInfoTooltipContent() {
    const serviceAccount = this.args.serviceAccount;
    const { createdByUser, updatedByUser } = this.args.serviceAccount;
    const hasUpdatedByUser = !!updatedByUser?.get('id');

    return [
      {
        title: this.intl.t('createdOn').toUpperCase(),
        iconName: 'check-circle',
        iconColor: 'success' as const,
        value: dayjs(serviceAccount.createdOn).format('MMMM DD, YYYY, hh:mm'),
        valueColor: 'success' as const,
        divider: true,
      },
      {
        title: this.intl.t('createdBy').toUpperCase(),
        iconName: 'info',
        iconClass: 'value-info-icon',
        loading: createdByUser.isPending,
        value: `${createdByUser.get('username')} (${createdByUser.get('email')})`,
        valueColor: 'textPrimary' as const,
        divider: hasUpdatedByUser,
      },
      ...(hasUpdatedByUser
        ? [
            {
              title: this.intl.t('updatedOn').toUpperCase(),
              iconName: 'check-circle',
              iconColor: 'success' as const,
              value: dayjs(serviceAccount.updatedOn).format(
                'MMMM DD, YYYY, hh:mm'
              ),
              valueColor: 'success' as const,
              divider: true,
            },
            {
              title: this.intl.t('updatedBy').toUpperCase(),
              iconName: 'info',
              iconClass: 'value-info-icon',
              loading: updatedByUser?.isPending,
              value: `${updatedByUser?.get('username')} (${updatedByUser?.get('email')})`,
              valueColor: 'textPrimary' as const,
            },
          ]
        : []),
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::AccountOverview::AuditInfo': typeof OrganizationServiceAccountSectionAccountOverviewAuditInfoComponent;
  }
}
