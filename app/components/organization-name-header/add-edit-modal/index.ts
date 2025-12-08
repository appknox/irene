import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type AnalyticsService from 'irene/services/analytics';
import type OrganizationModel from 'irene/models/organization';

export interface OrganizationNameAddEditModalSignature {
  Args: {
    organization: OrganizationModel;
    editModal?: boolean;
    handleCancel: () => void;
  };
  Element: HTMLElement;
}

export default class OrganizationNameAddEditModal extends Component<OrganizationNameAddEditModalSignature> {
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked newOrUpdatedOrgName = '';
  @tracked showSuccessMessage = false;

  constructor(
    owner: unknown,
    args: OrganizationNameAddEditModalSignature['Args']
  ) {
    super(owner, args);

    this.newOrUpdatedOrgName = this.args.organization.name;
  }

  get actionType() {
    return this.args.editModal ? 'edit' : 'add';
  }

  get modalHeaderTitle() {
    if (this.showSuccessMessage) {
      return this.intl.t('message');
    }

    return this.args.editModal
      ? this.intl.t('editName')
      : this.intl.t('addName');
  }

  get inputPlaceholder() {
    return this.args.organization.name || this.intl.t('organizationName');
  }

  get inputLabel() {
    return this.args.editModal
      ? this.intl.t('organizationNameEditLabel')
      : this.intl.t('organizationNameAddLabel');
  }

  updateOrgName = task(async () => {
    const org = this.args.organization;
    const existingName = org.name;

    try {
      org.set('name', this.newOrUpdatedOrgName);
      await org.save();

      this.showSuccessMessage = true;

      this.analytics.track({
        name: 'ORG_NAME_UPDATE_EVENT',
        properties: {
          organization_id: org.id,
          organization_name: org.name,
        },
      });
    } catch (error) {
      const err = error as AdapterError;

      org.set('name', existingName);

      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors?.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationNameHeader::AddEditModal': typeof OrganizationNameAddEditModal;
  }
}
