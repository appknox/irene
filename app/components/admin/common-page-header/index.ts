import Component from '@glimmer/component';

export interface AdminCommonPageHeaderComponentSignature {
  Args: {
    title: string;
    subtitle: string;
  };
  Blocks: {
    default: [];
  };
}

export default class AdminCommonPageHeaderComponent extends Component<AdminCommonPageHeaderComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::CommonPageHeader': typeof AdminCommonPageHeaderComponent;
  }
}
