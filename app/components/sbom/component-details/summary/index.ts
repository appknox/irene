import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import type IntlService from 'ember-intl/services/intl';

import * as semver from 'semver';
import type SbomComponentModel from 'irene/models/sbom-component';

interface componentSummaryItem {
  label: string;
  value?: string | null;
  component?: 'sbom/component-status' | null;
  isLink?: boolean;
}

export interface SbomComponentDetailsSummarySignature {
  Element: HTMLDivElement;
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

export default class SbomComponentDetailsSummaryComponent extends Component<SbomComponentDetailsSummarySignature> {
  @service declare intl: IntlService;

  get isLatestVersionLess() {
    const latestVersion = this.args.sbomComponent?.cleanLatestVersion;
    const version = this.args.sbomComponent?.cleanVersion;

    if (
      !latestVersion ||
      !version ||
      !semver.valid(latestVersion) ||
      !semver.valid(version)
    ) {
      return false;
    }

    return semver.lt(latestVersion, version);
  }

  get isLiscenceAvailable() {
    return (
      this.args.sbomComponent?.licenses &&
      this.args.sbomComponent?.licenses.length > 0
    );
  }

  get componentSummaryLength() {
    return this.componentSummary.length - 1;
  }

  get componentType() {
    if (this.args.sbomComponent?.isMLModel) {
      return this.intl.t('sbomModule.mlModel');
    }

    return capitalize(this.args.sbomComponent?.type) || '-';
  }

  get componentSummary() {
    return [
      {
        label: this.intl.t('sbomModule.componentType'),
        value: this.componentType,
      },
      {
        label: this.intl.t('dependencyType'),
        value: this.args.sbomComponent?.isDependency
          ? this.intl.t('dependencyTypes.transitive')
          : this.intl.t('dependencyTypes.direct') || '-',
      },
      this.args.sbomComponent?.cleanVersion && {
        label: this.intl.t('version'),
        value: this.args.sbomComponent?.cleanVersion,
      },
      this.args.sbomComponent?.cleanLatestVersion && {
        label: this.intl.t('sbomModule.latestVersion'),
        value: this.isLatestVersionLess
          ? '-'
          : this.args.sbomComponent?.cleanLatestVersion,
      },
      {
        label: this.intl.t('status'),
        component: 'sbom/component-status' as const,
      },
      this.args.sbomComponent?.author && {
        label: this.intl.t('author'),
        value: this.args.sbomComponent?.author,
      },
      this.isLiscenceAvailable && {
        label: this.intl.t('license'),
        value: this.args.sbomComponent?.licenses.join(', '),
      },
      this.args.sbomComponent?.isMLModel && {
        label: this.intl.t('evidenceLocation'),
        value: this.args.sbomComponent?.primaryEvidenceLocation || '',
      },
      this.args.sbomComponent?.isMLModel && {
        label: this.intl.t('referenceLink'),
        value: this.args.sbomComponent?.primaryLink || '',
        isLink: true,
      },
    ].filter(Boolean) as componentSummaryItem[];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Summary': typeof SbomComponentDetailsSummaryComponent;
    'sbom/component-details/summary': typeof SbomComponentDetailsSummaryComponent;
  }
}
