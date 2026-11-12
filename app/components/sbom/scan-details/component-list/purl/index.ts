import Component from '@glimmer/component';

import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomScanDetailsComponentListPurlSignature {
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

/**
 * Insights-tab component cell: the component's package reference in mono,
 * wrapping instead of truncating. The scan's `bomRef` is versionless
 * (`maven::group:artifact`), so the version is appended to keep two versions
 * of the same library distinguishable. A real purl that already carries a
 * version is shown as is. Falls back to the name when the scan recorded no
 * bom-ref.
 */
export default class SbomScanDetailsComponentListPurlComponent extends Component<SbomScanDetailsComponentListPurlSignature> {
  get version() {
    return this.args.sbomComponent?.version?.trim().replace(/(^")|("$)/g, '');
  }

  get label() {
    const component = this.args.sbomComponent;
    const bomRef = component?.bomRef?.trim();
    const base = bomRef || component?.name || '-';

    if (!bomRef || !this.version || /@[^/@]+$/.test(bomRef)) {
      return base;
    }

    return `${bomRef}@${this.version}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::Purl': typeof SbomScanDetailsComponentListPurlComponent;
    'sbom/scan-details/component-list/purl': typeof SbomScanDetailsComponentListPurlComponent;
  }
}
