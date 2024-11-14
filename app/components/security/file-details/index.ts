import Component from '@glimmer/component';
import type SecurityFileModel from 'irene/models/security/file';

export interface SecurityFileDetailsComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

export default class SecurityFileDetailsComponent extends Component<SecurityFileDetailsComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileDetails': typeof SecurityFileDetailsComponent;
  }
}
