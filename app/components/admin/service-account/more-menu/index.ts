import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import type ServiceAccountModel from 'irene/models/service-account';

export interface AdminServiceAccountMoreMenuSignature {
  Args: {
    anchorRef: HTMLElement | null;
    onClose: () => void;
    onDeleteSuccess: () => void;
    serviceAccount: ServiceAccountModel;
  };
}

export default class AdminServiceAccountMoreMenuComponent extends Component<AdminServiceAccountMoreMenuSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showDeleteConfirm = false;

  get menuItems() {
    return [
      {
        link: true,
        route: 'authenticated.admin.service-account.create',
        query: { duplicate: this.args.serviceAccount.id },
        label: 'Duplicate',
        divider: true,
      },
      {
        button: true,
        label: this.intl.t('delete'),
        onClick: this.handleDeleteClick,
      },
    ];
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
    'Admin::ServiceAccount::MoreMenu': typeof AdminServiceAccountMoreMenuComponent;
  }
}
