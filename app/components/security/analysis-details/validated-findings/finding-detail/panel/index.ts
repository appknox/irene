import Component from '@glimmer/component';
import { action } from '@ember/object';

import type { AkIconVariantType } from 'ak-icons';

import type { AkIconColorVariant } from 'irene/components/ak-icon';
import type { SecurityAnalysisFindingPanelId } from '../index';

export interface SecurityAnalysisDetailsValidatedFindingsFindingDetailPanelSignature {
  Args: {
    panelId: SecurityAnalysisFindingPanelId;
    title: string;
    iconName: AkIconVariantType;
    iconColor?: AkIconColorVariant;
    disabled?: boolean;
    isExpanded: boolean;
    onToggle: (panelId: SecurityAnalysisFindingPanelId) => void;
    onSave: (panelId: SecurityAnalysisFindingPanelId) => void;
  };
  Blocks: {
    default: [];
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsFindingDetailPanelComponent extends Component<SecurityAnalysisDetailsValidatedFindingsFindingDetailPanelSignature> {
  @action
  handleToggle() {
    this.args.onToggle(this.args.panelId);
  }

  @action
  handleSave(event: MouseEvent) {
    // The save button sits inside the accordion summary, so the click would
    // otherwise toggle the panel as well.
    event.stopPropagation();

    this.args.onSave(this.args.panelId);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::FindingDetail::Panel': typeof SecurityAnalysisDetailsValidatedFindingsFindingDetailPanelComponent;
  }
}
