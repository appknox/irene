import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SbomComponentModel from 'irene/models/sbom-component';

export interface SbomComponentInsightsDetailsSignature {
  Element: HTMLElement;
  Args: {
    sbomComponent: SbomComponentModel;
  };
}

/**
 * Collapsible "Component Details" strip. Collapsed it summarises the
 * component on one line; expanded it shows the shared summary list.
 */
export default class SbomComponentInsightsDetailsComponent extends Component<SbomComponentInsightsDetailsSignature> {
  @service declare intl: IntlService;

  @tracked isExpanded = false;

  contentId = `sbom-insights-details-${guidFor(this)}`;

  /** "Direct · v2.9.1 · Latest 2.17.0 · Apache-2.0", skipping unknown parts. */
  get inlineSummary() {
    const component = this.args.sbomComponent;
    const { cleanVersion, cleanLatestVersion } = component;

    const parts = [
      component.isDependency
        ? this.intl.t('dependencyTypes.transitive')
        : this.intl.t('dependencyTypes.direct'),
      cleanVersion ? `v${cleanVersion}` : null,
      cleanLatestVersion
        ? `${this.intl.t('sbomModule.componentInsights.latest')} ${cleanLatestVersion}`
        : null,
      component.licenses?.length ? component.licenses.join(', ') : null,
    ];

    return parts.filter(Boolean).join(' · ');
  }

  @action
  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInsights::Details': typeof SbomComponentInsightsDetailsComponent;
    'sbom/component-insights/details': typeof SbomComponentInsightsDetailsComponent;
  }
}
