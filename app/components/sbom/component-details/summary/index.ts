import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import type IntlService from 'ember-intl/services/intl';

import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomComponentDetailsSummarySignature {
  Element: HTMLDivElement;
  Args: {
    sbomComponent: SbomComponentModel | null;
  };
}

export default class SbomComponentDetailsSummaryComponent extends Component<SbomComponentDetailsSummarySignature> {
  @service declare intl: IntlService;

  get componentSummary() {
    return [
      {
        label: this.intl.t('sbomModule.componentType'),
        value: capitalize(this.args.sbomComponent?.type || ''),
      },
      {
        label: this.intl.t('dependencyType'),
        value: this.args.sbomComponent?.isDependency
          ? this.intl.t('dependencyTypes.transitive')
          : this.intl.t('dependencyTypes.direct'),
      },
      {
        label: this.intl.t('version'),
        value: this.args.sbomComponent?.version,
      },
      {
        label: this.intl.t('sbomModule.latestVersion'),
        value: this.args.sbomComponent?.latestVersion,
      },
      {
        label: this.intl.t('status'),
        component: 'sbom/component-status' as const,
      },
      {
        label: this.intl.t('author'),
        value: this.args.sbomComponent?.author,
      },
      {
        label: this.intl.t('license'),
        value: this.args.sbomComponent?.licenses.join(', '),
        isLast: true,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Summary': typeof SbomComponentDetailsSummaryComponent;
    'sbom/component-details/summary': typeof SbomComponentDetailsSummaryComponent;
  }
}
