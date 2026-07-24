import { action } from '@ember/object';
import Component from '@glimmer/component';

import type { AkIconVariantType } from 'ak-icons';

export interface SbomScanDetailsSummaryBarItem {
  iconName: AkIconVariantType;
  label: string;
  value: number | string;
  isClickable?: boolean;
  onValueClick?: () => void;
  newFeature?: boolean;
  hideDivider?: boolean;
  // The leading "Total" item (SBOM Components / AI BoM Components) is
  // always bold in the design, distinguishing it from the per-type
  // breakdown that follows it.
  isPrimary?: boolean;
}

export interface SbomScanDetailsSummaryBarSignature {
  Element: HTMLElement;
  Args: {
    items: SbomScanDetailsSummaryBarItem[];
  };
}

export default class SbomScanDetailsSummaryBarComponent extends Component<SbomScanDetailsSummaryBarSignature> {
  @action
  noop() {}
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::SummaryBar': typeof SbomScanDetailsSummaryBarComponent;
  }
}
