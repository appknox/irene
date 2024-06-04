import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import { next } from '@ember/runloop';
import { ComponentLike } from '@glint/template';

import AnalysisModel from 'irene/models/analysis';
import VulnerabilityPreferenceModel from 'irene/models/vulnerability-preference';

export interface AnalysisRiskOverrideEditDrawerSignature {
  Args: {
    dataModel: AnalysisRiskDataModel;
    open: boolean;
    onClose: () => void;
  };
}

type ResetConfirmComponent = ComponentLike<{
  dataModel: AnalysisRiskDataModel;
  resetHandler: (all?: boolean) => void;
  resetCancelHandler?: () => void;
  isResetRunning: boolean;
  isResetSuccess: boolean;
}>;

export interface AnalysisRiskDataModel {
  model: AnalysisModel | VulnerabilityPreferenceModel;
  vulnerabilityName: string;
  computedRisk: number;
  isOverridden?: boolean;
  risk?: number | null;
  overriddenRisk?: number | null;
  status?: number;
  overriddenRiskComment: string | null;
  overriddenBy: string | null;
  overrideCriteria: string | null;
  overrideCriteriaOptions: { label: string; value: string }[];
  overriddenOn: Date | null;
  overrideSuccessMessage: string;
  showOverrideSuccessOriginalToOverriddenRisk?: boolean;
  ignoreVulnerabilityHelperText: string;

  resetConfirmComponent: ResetConfirmComponent;

  resetOverrideHandler: (all: boolean) => Promise<void>;

  editSaveOverrideHandler: (
    risk: number,
    comment: string,
    all: boolean
  ) => Promise<void>;
}

export type OverrideEditDrawerAppBarData = {
  title: string;
  onBackClick?: (event: Event) => void;
};

export default class AnalysisRiskOverrideEditDrawerComponent extends Component<AnalysisRiskOverrideEditDrawerSignature> {
  @service declare intl: IntlService;

  @tracked appBarData?: OverrideEditDrawerAppBarData;

  @action
  setAppBarData(appBarData: OverrideEditDrawerAppBarData) {
    next(this, () => {
      this.appBarData = appBarData;
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer': typeof AnalysisRiskOverrideEditDrawerComponent;
  }
}
