import Component from '@glimmer/component';
import type { AkChipColor } from 'irene/components/ak-chip';

interface AdminUserManagementUsersTableMemberStatusSignature {
  Element: HTMLDivElement;
  Args: {
    color?: AkChipColor;
    label?: string;
  };
}

export default class AdminUserManagementUsersTableMemberStatusComponent extends Component<AdminUserManagementUsersTableMemberStatusSignature> {
  get showChip() {
    return this.args.color && this.args.label;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::UserManagement::Users::Table::MemberStatus': typeof AdminUserManagementUsersTableMemberStatusComponent;
  }
}
