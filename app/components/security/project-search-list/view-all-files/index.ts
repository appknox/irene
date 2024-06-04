import Component from '@glimmer/component';
import SecurityProjectModel from 'irene/models/security/project';

export interface SecurityProjectSearchListViewAllFilesComponentSignature {
  Args: {
    project: SecurityProjectModel;
  };
}

export default class SecurityProjectSearchListViewAllFilesComponent extends Component<SecurityProjectSearchListViewAllFilesComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::ProjectSearchList::ViewAllFiles': typeof SecurityProjectSearchListViewAllFilesComponent;
    'security/project-search-list/view-all-files': typeof SecurityProjectSearchListViewAllFilesComponent;
  }
}
