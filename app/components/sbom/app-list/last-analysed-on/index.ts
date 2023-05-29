import Component from '@glimmer/component';
import SbomProjectModel from 'irene/models/sbom-project';
import dayjs from 'dayjs';

export interface SbomProjectListLastAnalysedOnSignature {
  Args: {
    sbomProject: SbomProjectModel;
  };
}

export default class SbomProjectListLastAnalysedOnComponent extends Component<SbomProjectListLastAnalysedOnSignature> {
  get lastAnalysedOn() {
    const completedAt = this.args.sbomProject.latestSbFile?.get('completedAt');

    if (completedAt) {
      return dayjs(completedAt).format('DD MMM YYYY');
    }

    return '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::LastAnalysedOn': typeof SbomProjectListLastAnalysedOnComponent;
    'sbom/app-list/last-analysed-on': typeof SbomProjectListLastAnalysedOnComponent;
  }
}
