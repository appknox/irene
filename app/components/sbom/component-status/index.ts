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

export default class SbomComponentStatusComponent extends Component<SbomComponentStatusSignature> {
  @service declare intl: IntlService;

  get isOutdated() {
    const component = this.args.sbomComponent;

    if (!component?.latestVersion || !component?.version) {
      return false;
    } else if (
      !semver.valid(component.cleanVersion) ||
      !semver.valid(component.cleanLatestVersion)
    ) {
      return false;
    } else if (
      semver.compare(component.cleanVersion, component.cleanLatestVersion) ===
      -1
    ) {
      return true;
    }

    return false;
  }

  get componentStatus() {
    const status = [] as ComponentStatus[];
    const component = this.args.sbomComponent;

    if (component) {
      if (component.isVulnerable) {
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
