import { service } from '@ember/service';
import Component from '@glimmer/component';
import type SbomComponentInventoryModel from 'irene/models/sbom-component-inventory';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';
import * as semver from 'semver';

export interface SbomComponentStatusSignature {
  Args: {
    sbomComponent: SbomComponentModel | SbomComponentInventoryModel | null;
  };
}

type ComponentStatus = {
  label: string;
  color: 'default' | 'primary' | 'success';
};

// Synthetic pkg:file/* or pkg:generic/* artifacts aren't CVE-tracked, so vulnerabilitiesCount is always 0;
// "Secure" would imply a vulnerability check that never occurred.
const NO_VULNERABILITY_FEED_ARTIFACT_CLASSES = new Set([
  'model',
  'tokenizer',
  'config',
  'supporting',
  'cloud_endpoint',
  'platform_managed_ai',
]);

export default class SbomComponentStatusComponent extends Component<SbomComponentStatusSignature> {
  @service declare intl: IntlService;

  get isOutdated() {
    const component = this.args.sbomComponent;

    if (
      !component?.latestVersion ||
      !component?.version ||
      !semver.valid(component.cleanVersion) ||
      !semver.valid(component.cleanLatestVersion)
    ) {
      return false;
    }

    return (
      semver.compare(component.cleanVersion, component.cleanLatestVersion) ===
      -1
    );
  }

  get componentStatus() {
    const status = [] as ComponentStatus[];
    const component = this.args.sbomComponent;

    if (component) {
      const aiArtifactClass =
        'aiArtifactClass' in component ? component.aiArtifactClass : '';

      if (
        component.isMLModel ||
        NO_VULNERABILITY_FEED_ARTIFACT_CLASSES.has(aiArtifactClass)
      ) {
        status.push({
          label: this.intl.t('chipStatus.unknown'),
          color: 'default',
        });
      } else if (component.isVulnerable) {
        status.push({
          label: this.intl.t('chipStatus.vulnerable'),
          color: 'primary',
        });
      } else {
        status.push({
          label: this.intl.t('chipStatus.secure'),
          color: 'success',
        });
      }

      if (this.isOutdated) {
        status.push({
          label: this.intl.t('chipStatus.outdated'),
          color: 'default',
        });
      }
    }

    return status;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentStatus': typeof SbomComponentStatusComponent;
    'sbom/component-status': typeof SbomComponentStatusComponent;
  }
}
