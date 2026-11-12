import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomComponentInsightsSignature {
  Element: HTMLElement;
  Args: {
    sbomComponent: SbomComponentModel;
    /** Value of the `vuln` query param. */
    vuln?: string | null;
  };
}

/** Component page opened from the Reachability insights tab. */
export default class SbomComponentInsightsComponent extends Component<SbomComponentInsightsSignature> {
  @service declare router: RouterService;

  /**
   * "maven::com.fasterxml.jackson.core : jackson-databind": the BOM
   * reference (without a trailing version, when it carries one) with the
   * name set apart.
   */
  get coordinate() {
    const { bomRef, name, cleanVersion } = this.args.sbomComponent;

    if (!bomRef) {
      return name;
    }

    const lastSegment = bomRef.substring(bomRef.lastIndexOf(':') + 1);
    const ref =
      cleanVersion && lastSegment === cleanVersion
        ? bomRef.substring(0, bomRef.lastIndexOf(':'))
        : bomRef;

    const split = ref.lastIndexOf(':');

    if (split === -1) {
      return ref;
    }

    const prefix = ref.substring(0, split);
    const leaf = ref.substring(split + 1);

    // An empty group leaves "eco::" behind; drop the dangling separator so
    // it reads "eco : name".
    return `${prefix.replace(/:+$/, '')} : ${leaf}`;
  }

  /** Keeps the URL shareable without adding a history entry per step. */
  @action
  handleSelect(displayId: string) {
    this.router.replaceWith(this.router.currentRouteName ?? '', {
      queryParams: { vuln: displayId },
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInsights': typeof SbomComponentInsightsComponent;
    'sbom/component-insights': typeof SbomComponentInsightsComponent;
  }
}
