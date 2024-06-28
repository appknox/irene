import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import FileModel from 'irene/models/file';
import ManualscanModel, { UserRole } from 'irene/models/manualscan';

export interface FileDetailsScanActionsOldManualScanLoginDetailsSignature {
  Args: {
    file: FileModel;
    manualscan: ManualscanModel | null;
  };
}

export default class FileDetailsScanActionsOldManualScanLoginDetailsComponent extends Component<FileDetailsScanActionsOldManualScanLoginDetailsSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked role = '';
  @tracked username = '';
  @tracked password = '';
  @tracked showRemoveRoleConfirmBox = false;
  @tracked selectedUserRole: UserRole | null = null;

  get loginStatuses() {
    return ['yes', 'no'];
  }

  get columns() {
    return [
      { name: this.intl.t('username'), valuePath: 'username' },
      { name: this.intl.t('role'), valuePath: 'role' },
      { name: this.intl.t('password'), valuePath: 'password' },
      {
        name: this.intl.t('action'),
        component:
          'file-details/scan-actions/manual-scan/login-details/user-role-action' as const,
        textAlign: 'center',
      },
    ];
  }

  get allUserRoles() {
    return (
      this.args.manualscan?.userRoles.map((role, i) => {
        role.id = i + 1;
        return role;
      }) || []
    );
  }

  get hasUserRole() {
    return this.allUserRoles.length > 0;
  }

  @action
  handleDeleteUserRoleConfirmBoxOpen(role: UserRole) {
    this.showRemoveRoleConfirmBox = true;
    this.selectedUserRole = role;
  }

  @action
  handleDeleteUserRoleConfirmBoxClose() {
    this.showRemoveRoleConfirmBox = false;
    this.selectedUserRole = null;
  }

  @action
  handleDeleteUserRole() {
    this.args.manualscan?.set(
      'userRoles',
      this.allUserRoles.filter((it) => it.id !== this.selectedUserRole?.id)
    );

    this.handleDeleteUserRoleConfirmBoxClose();
  }

  @action
  handleLoginStatusChange(status: string) {
    this.args.manualscan?.set('loginRequired', status === 'yes');
  }

  @action
  addUserRole() {
    const tRoleAdded = this.intl.t('tRoleAdded');
    const tPleaseEnterAllValues = this.intl.t('tPleaseEnterAllValues');

    for (const inputValue of [this.role, this.username, this.password]) {
      if (isEmpty(inputValue)) {
        return this.notify.error(tPleaseEnterAllValues);
      }
    }

    const userRoles = this.args.manualscan?.userRoles || [];

    const userRole = {
      id: userRoles.length + 1,
      role: this.role,
      username: this.username,
      password: this.password,
    };

    userRoles.addObject(userRole);

    this.args.manualscan?.set('userRoles', userRoles);

    this.notify.success(tRoleAdded);

    this.role = '';
    this.username = '';
    this.password = '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActionsOld::ManualScan::LoginDetails': typeof FileDetailsScanActionsOldManualScanLoginDetailsComponent;
    'file-details/scan-actions-old/manual-scan/login-details': typeof FileDetailsScanActionsOldManualScanLoginDetailsComponent;
  }
}
