import Component from '@glimmer/component';
import SbomAppModel from 'irene/models/sbom-app';
import dayjs from 'dayjs';

export interface SbomAppListLastAnalysedOnSignature {
  Args: {
    sbomApp: SbomAppModel;
  };
}

export default class SbomAppListLastAnalysedOnComponent extends Component<SbomAppListLastAnalysedOnSignature> {
  get lastAnalysedOn() {
    const completedAt = this.args.sbomApp.latestSbFile?.get('completedAt');

    if (completedAt) {
      return dayjs(completedAt).format('DD MMM YYYY');
    }

    return '-';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::LastAnalysedOn': typeof SbomAppListLastAnalysedOnComponent;
    'sbom/app-list/last-analysed-on': typeof SbomAppListLastAnalysedOnComponent;
  }
}
