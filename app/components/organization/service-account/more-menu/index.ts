import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import type ServiceAccountModel from 'irene/models/service-account';

export interface OrganizationServiceAccountMoreMenuSignature {
  Args: {
    anchorRef: HTMLElement | null;
    onClose: () => void;
    onDeleteSuccess: () => void;
    serviceAccount: ServiceAccountModel;
  };
}

interface MenuItem {
  label: string;
  divider?: boolean;
  link?: boolean;
  route?: string;
  query?: Record<string, unknown>;
  button?: boolean;
  onClick?: () => void;
}

export default class OrganizationServiceAccountMoreMenuComponent extends Component<OrganizationServiceAccountMoreMenuSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showDeleteConfirm = false;

  get menuItems(): MenuItem[] {
    const items: MenuItem[] = [
      {
        link: true,
        route: 'authenticated.dashboard.service-account-create',
        query: { duplicate: this.args.serviceAccount.id },
        label: 'Duplicate',
        divider: true,
      },
    ];

    // A CLI-enabled service account cannot be deleted — see
    // serviceAccountModule.cliEnabledDescription.
    if (!this.args.serviceAccount.cliEnabled) {
      items.push({
        button: true,
        label: this.intl.t('delete'),
        onClick: this.handleDeleteClick,
      });
    }

    return items;
  }

  @action
  handleDeleteClick() {
    this.showDeleteConfirm = true;

    this.args.onClose();
  }

  @action
  handleDeleteConfirmClose() {
    this.showDeleteConfirm = false;
  }

  deleteServiceAccount = task(async () => {
    try {
      await this.args.serviceAccount.destroyRecord();

      this.notify.success(this.intl.t('serviceAccountModule.deleteSuccessMsg'));

      this.args.onDeleteSuccess();
      this.handleDeleteConfirmClose();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::MoreMenu': typeof OrganizationServiceAccountMoreMenuComponent;
  }
}
