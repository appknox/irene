import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import { findingDisplayVerdict } from 'irene/utils/sbom-reachability';

const COMPONENT_DETAILS_ROUTE =
  'authenticated.dashboard.sbom.component-details';

type HumanizedVersionRange = {
  affectedRange: string | null;
  fixedRange: string | null;
};

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperSignature {
  Element: HTMLDivElement;
  Args: {
    sbomVulnerabilityAudit: SbomVulnerabilityAuditModel;
    sbomComponent?: SbomComponentModel | null;
    /** Every vulnerability of the component, for the shared remediation. */
    componentAudits?: SbomVulnerabilityAuditModel[] | null;
    /** Asks the list to load every vulnerability, once remediation shows. */
    onNeedAllAudits?: () => void;
    /**
     * Show a link to this vulnerability on the reachability insights page.
     * Off by default; only the Complete-analysis vulnerabilities tab sets it.
     */
    showInsightLink?: boolean;
    /**
     * Start with the detail content open. The insights page shows one
     * vulnerability at a time with no row to toggle, so it passes true.
     */
    expanded?: boolean;
    /** Render "Affected & Fixed Versions" and "Source". Defaults to true. */
    showAdvisoryMeta?: boolean;
    /** Render the Reachability and Remediation sections. Defaults to true. */
    showReachability?: boolean;
  };
  Blocks: {
    default: [
      { isContentCollapsed: boolean; collapsibleContentHandler: () => void },
    ];
  };
}

export default class SbomComponentDetailsVulnerabilitiesDetailWrapperComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked isContentCollapsed = !this.args.expanded;

  get humanizedVersionRangeList() {
    const { parsedVersions, humanizedVersionRange } =
      this.args.sbomVulnerabilityAudit;

    return parsedVersions
      .map((v) =>
        v.version_range ? humanizedVersionRange(v.version_range) : null
      )
      .filter(Boolean) as HumanizedVersionRange[];
  }

  get showAdvisoryMeta() {
    return this.args.showAdvisoryMeta ?? true;
  }

  get showReachability() {
    return this.args.showReachability ?? true;
  }

  get isHumanizedVersionRangeListEmpty() {
    return this.humanizedVersionRangeList.length === 0;
  }

  /**
   * The insight link is offered only when asked for and when the advisory has
   * a reachability verdict the insights page can present.
   */
  get showInsightLink() {
    return (
      Boolean(this.args.showInsightLink) &&
      Boolean(
        findingDisplayVerdict(this.args.sbomVulnerabilityAudit.reachability)
      )
    );
  }

  /** Display id the insights page matches its `vuln` query param against. */
  get insightLinkQuery() {
    return {
      vuln: this.args.sbomVulnerabilityAudit.sbVulnerability?.vulnerabilityId,
    };
  }

  /**
   * Dynamic segments of the current component-details route, so the insights
   * page opens the same component under the same parent. Falls back to the
   * component's own records (and the root parent) outside that route.
   */
  get insightLinkModels(): string[] {
    const params = this.router.currentRoute?.find(
      (info) => info.name === COMPONENT_DETAILS_ROUTE
    )?.params;

    const component = this.args.sbomComponent;
    // `get` reads through the async belongsTo proxies.
    const fromComponent = (path: string) =>
      component ? get(component, path) : undefined;

    return [
      params?.['sbom_project_id'] ?? fromComponent('sbFile.sbProject.id'),
      params?.['sbom_file_id'] ?? fromComponent('sbFile.id'),
      params?.['sbom_component_id'] ?? component?.id,
      params?.['sbom_component_parent_id'] ?? '0',
    ].map((segment) => String(segment ?? ''));
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
