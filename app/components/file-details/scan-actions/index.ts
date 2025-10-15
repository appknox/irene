import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import FileModel from 'irene/models/file';
import OrganizationService from 'irene/services/organization';
import ENUMS from 'irene/enums';

export interface FileDetailsScanActionsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsScanActionsComponent extends Component<FileDetailsScanActionsSignature> {
  @service declare organization: OrganizationService;

  get isManualScanDisabled() {
    return !this.args.file.project.get('isManualScanAvailable');
  }

  get isAPIScanEnabled() {
    return this.args.file.project.get('isAPIScanEnabled');
  }

  get vulnerabilityCounts() {
    return this.args.file.analyses.reduce(
      (acc, analysis) => {
        if (!analysis.isRisky) {
          return acc;
        }

        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.STATIC)) {
          acc.static++;
        }

        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.DYNAMIC)) {
          acc.dynamic++;
        }

        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.API)) {
          acc.api++;
        }

        if (analysis.hasType(ENUMS.VULNERABILITY_TYPE.MANUAL)) {
          acc.manual++;
        }

        return acc;
      },
      { static: 0, dynamic: 0, api: 0, manual: 0 }
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ScanActions': typeof FileDetailsScanActionsComponent;
  }
}
