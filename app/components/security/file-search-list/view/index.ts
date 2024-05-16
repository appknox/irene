import Component from '@glimmer/component';
import SecurityFileModel from 'irene/models/security/file';

export interface SecurityFileSearchListViewComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

export default class SecurityFileSearchListViewComponent extends Component<SecurityFileSearchListViewComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileSearchList::View': typeof SecurityFileSearchListViewComponent;
    'security/file-search-list/view': typeof SecurityFileSearchListViewComponent;
  }
}
