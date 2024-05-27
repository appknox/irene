import Component from '@glimmer/component';
import type SecurityFileModel from 'irene/models/security/file';

export interface SecurityFileDetailsComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

export default class SecurityFileDetailsComponent extends Component<SecurityFileDetailsComponentSignature> {
  get file() {
    return this.args.file;
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.security.projects',
        linkTitle: 'All Projects',
      },
      this.file?.project?.get('id')
        ? {
            route: 'authenticated.security.files',
            linkTitle: 'List of Files',
            model: this.file?.project?.get('id'),
          }
        : null,
      {
        route: 'authenticated.security.file',
        linkTitle: 'File Details',
      },
    ].filter(Boolean);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileDetails': typeof SecurityFileDetailsComponent;
  }
}
