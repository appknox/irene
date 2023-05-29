import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import SbomProjectModel from 'irene/models/sbom-project';
import SbomFileModel from 'irene/models/sbom-file';
import SbomComponentModel from 'irene/models/sbom-component';
import IntlService from 'ember-intl/services/intl';

export interface SbomScanDetailsComponentDetailsSignature {
  Args: {
    sbomComponent: SbomComponentModel | null;
    sbomFile: SbomFileModel;
    sbomProject: SbomProjectModel;
    open?: boolean;
    onClose: () => void;
  };
}

type TabItem = {
  id: string;
  label: string;
  component:
    | 'sbom/scan-details/component-details/summary'
    | 'sbom/scan-details/component-details/vulnerabilities';
  hasBadge?: boolean;
  badgeCount?: string | number;
};

export default class SbomScanDetailsComponentDetailsComponent extends Component<SbomScanDetailsComponentDetailsSignature> {
  @service declare intl: IntlService;

  @tracked selectedTab = 'component_details';

  get tabItems() {
    return [
      {
        id: 'component_details',
        label: this.intl.t('sbomModule.componentDetails'),
        component: 'sbom/scan-details/component-details/summary',
      },
      {
        id: 'known_vulnerabilities',
        badgeCount: this.args.sbomComponent?.vulnerabilitiesCount,
        hasBadge: true,
        label: this.intl.t('sbomModule.knownVulnerabilities'),
        component: 'sbom/scan-details/component-details/vulnerabilities',
      },
    ] as TabItem[];
  }

  get appDrawerTitle() {
    return this.tabItems.find((t) => t.id === this.selectedTab)?.label;
  }

  get activeTabComponent() {
    return this.tabItems.find((t) => t.id === this.selectedTab)?.component;
  }

  @action
  handleTabClick(id: string) {
    this.selectedTab = id;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentDetails': typeof SbomScanDetailsComponentDetailsComponent;
  }
}
