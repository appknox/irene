import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';

type HumanizedVersionRange = {
  affectedRange: string | null;
  fixedRange: string | null;
};

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperSignature {
  Element: HTMLDivElement;
  Args: {
    sbomVulnerabilityAudit: SbomVulnerabilityAuditModel;
  };
  Blocks: {
    default: [
      { isContentCollapsed: boolean; collapsibleContentHandler: () => void }
    ];
  };
}

export default class SbomComponentDetailsVulnerabilitiesDetailWrapperComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperSignature> {
  @service declare intl: IntlService;

  @tracked isContentCollapsed = true;

  get humanizedVersionRangeList() {
    const { parsedVersions, humanizedVersionRange } =
      this.args.sbomVulnerabilityAudit;

    return parsedVersions
      .map((v) =>
        v.version_range ? humanizedVersionRange(v.version_range) : null
      )
      .filter(Boolean) as HumanizedVersionRange[];
  }

  get isHumanizedVersionRangeListEmpty() {
    return this.humanizedVersionRangeList.length === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('sbomModule.affectedVersions'),
        valuePath: 'affectedRange',
      },
      {
        name: this.intl.t('sbomModule.fixedVersions'),
        valuePath: 'fixedRange',
      },
    ];
  }

  @action
  handleToggleCollapsibleContent() {
    this.isContentCollapsed = !this.isContentCollapsed;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperComponent;
  }
}
