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

  /** Direct, version, latest and license as icon chips; unknown parts skipped. */
  get summaryItems(): { key: string; icon: string; label: string }[] {
    const component = this.args.sbomComponent;
    const { cleanVersion, cleanLatestVersion } = component;

    const items = [
      {
        key: 'dependency',
        icon: 'mdi:link-variant',
        label: component.isDependency
          ? this.intl.t('dependencyTypes.transitive')
          : this.intl.t('dependencyTypes.direct'),
      },
      cleanVersion && {
        key: 'version',
        icon: 'mdi:tag-outline',
        label: `v${cleanVersion}`,
      },
      cleanLatestVersion && {
        key: 'latest',
        icon: 'mdi:arrow-up-circle-outline',
        label: `${this.intl.t('sbomModule.componentInsights.latest')} ${cleanLatestVersion}`,
      },
      component.licenses?.length && {
        key: 'license',
        icon: 'mdi:license',
        label: component.licenses.join(', '),
      },
    ];

    return items.filter(Boolean) as {
      key: string;
      icon: string;
      label: string;
    }[];
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
