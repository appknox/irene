import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import SbomComponentModel from 'irene/models/sbom-component';
import * as semver from 'semver';

export interface SbomComponentStatusSignature {
  Args: {
    sbomComponent: SbomComponentModel | null;
  };
}

type ComponentStatus = {
  label: string;
  color: 'default' | 'primary' | 'success';
};

// These artifact classes only ever get a synthetic pkg:file/* or pkg:generic/*
// purl (see ml_model_scanner.py / cloud_ai_scanner.py) — no vulnerability
// database tracks CVEs against them, so vulnerabilitiesCount is always 0 and
// "Secure" would falsely imply we checked and found nothing, when we never
// had anything real to check. "secret" is handled separately below — it's a
// real, actionable finding, not an absence of information.
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
      if (component.aiArtifactClass === 'secret') {
        status.push({
          label: this.intl.t('chipStatus.exposed'),
          color: 'primary',
        });
      } else if (
        component.isMLModel ||
        NO_VULNERABILITY_FEED_ARTIFACT_CLASSES.has(component.aiArtifactClass)
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
