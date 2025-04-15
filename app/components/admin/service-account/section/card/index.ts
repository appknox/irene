import Component from '@glimmer/component';
import styles from './index.scss';

export interface AdminServiceAccountSectionCardSignature {
  Args: {
    title: string;
    headerColor?: 'default' | 'primary';
    showHeaderAction?: boolean;
    showFooterAction?: boolean;
  };
  Blocks: {
    default: [];
    headerAction: [{ classes: { headerActionBtn?: string } }];
    footerAction: [];
  };
}

export default class AdminServiceAccountSectionCardComponent extends Component<AdminServiceAccountSectionCardSignature> {
  get headerColor() {
    return this.args.headerColor || 'default';
  }

  get classes() {
    return {
      headerActionBtn: styles['header-action-btn'],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::Section::Card': typeof AdminServiceAccountSectionCardComponent;
  }
}
