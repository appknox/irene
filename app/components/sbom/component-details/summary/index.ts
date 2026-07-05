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
  tooltip?: string | null;
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

    if (this.args.sbomComponent?.isPlatformManagedAi) {
      return this.intl.t('sbomModule.aiTypeLabel.platformManagedAi');
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
      this.args.sbomComponent?.hasFoundLocations && {
        label: this.intl.t('sbomModule.foundInLocations'),
        value: this.foundInValue,
        tooltip: this.foundInTooltip,
      },
      this.args.sbomComponent?.isMLModel && {
        label: this.intl.t('referenceLink'),
        value: this.args.sbomComponent?.primaryLink || '',
        isLink: true,
      },
      this.args.sbomComponent?.isAiComponent && {
        label: this.intl.t('sbomModule.aiRoleColumn'),
        value: this.aiPurposeLabel,
      },
      this.args.sbomComponent?.isAiComponent &&
        this.args.sbomComponent?.aiFamily !== '-' && {
          label: this.intl.t('sbomModule.aiFamilyColumn'),
          value: this.args.sbomComponent?.aiFamily,
        },
      this.args.sbomComponent?.isAiComponent && {
        label: this.intl.t('sbomModule.aiPurposeColumn'),
        value: this.args.sbomComponent?.aiPurpose,
      },
      this.args.sbomComponent?.isAiComponent && {
        label: this.intl.t('sbomModule.aiConfidenceLabel'),
        value: this.aiConfidenceDisplay,
        tooltip: this.aiConfidenceExplanation,
      },
      this.args.sbomComponent?.hasIdentifiedModelName && {
        label: this.intl.t('sbomModule.modelIdentificationMethod'),
        value:
          this.args.sbomComponent?.aiModelIdentificationConfidence ===
          'verified'
            ? this.intl.t('sbomModule.modelIdentifiedVerified')
            : this.intl.t('sbomModule.modelIdentifiedHeuristic'),
      },
    ].filter(Boolean) as componentSummaryItem[];
  }

  get aiPurposeLabel() {
    const key = this.args.sbomComponent?.aiDisplayLabelKey;
    return key ? this.intl.t(key) : '-';
  }

  get aiConfidenceDisplay() {
    const confidence = this.args.sbomComponent?.aiConfidence;
    return confidence ? capitalize(confidence) : '-';
  }

  get aiConfidenceExplanation() {
    const key = this.args.sbomComponent?.confidenceExplanationKey;
    return key ? this.intl.t(key) : null;
  }

  /**
   * Compact display value for the "Found In" row — the first file location,
   * with a "+N more" suffix when there's more than one. Common to every AI
   * component type that carries real evidence (models, cloud endpoints,
   * secrets), not just ML models. Named "Found In" rather than "Used In":
   * static scanning only proves where the pattern/file was detected, not
   * everywhere it's actually invoked from at runtime.
   */
  get foundInValue() {
    const locations = this.args.sbomComponent?.evidenceLocations ?? [];
    if (locations.length <= 1) {
      return locations[0] || '-';
    }
    return `${locations[0]} (+${locations.length - 1} more)`;
  }

  /**
   * Full newline-separated location list, shown via the same tooltip
   * mechanism already used for confidenceExplanation — only needed when
   * there's more than one location to disclose.
   */
  get foundInTooltip() {
    const locations = this.args.sbomComponent?.evidenceLocations ?? [];
    return locations.length > 1 ? locations.join('\n') : null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Summary': typeof SbomComponentDetailsSummaryComponent;
    'sbom/component-details/summary': typeof SbomComponentDetailsSummaryComponent;
  }
}
