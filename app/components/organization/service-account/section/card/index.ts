import Component from '@glimmer/component';
import styles from './index.scss';

export interface OrganizationServiceAccountSectionCardSignature {
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

export default class OrganizationServiceAccountSectionCardComponent extends Component<OrganizationServiceAccountSectionCardSignature> {
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
    'Organization::ServiceAccount::Section::Card': typeof OrganizationServiceAccountSectionCardComponent;
  }
}
