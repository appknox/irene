import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { isEmpty } from '@ember/utils';
import dayjs from 'dayjs';

import { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';
import { ActiveContentComponent } from '../content';
import ENUMS from 'irene/enums';

type OverrideAuditDetail = {
  label: string;
  icon: string;
  value: string;
  renderValue?: boolean;
};

export interface AnalysisRiskOverrideEditDrawerOverrideDetailsSignature {
  Args: {
    dataModel: AnalysisRiskDataModel;
    setActiveComponent: (component: ActiveContentComponent) => void;
    setAppBarData: (appBarData: OverrideEditDrawerAppBarData) => void;
  };
}

export default class AnalysisRiskOverrideEditDrawerOverrideDetailsComponent extends Component<AnalysisRiskOverrideEditDrawerOverrideDetailsSignature> {
  @service declare intl: IntlService;

  constructor(
    owner: unknown,
    args: AnalysisRiskOverrideEditDrawerOverrideDetailsSignature['Args']
  ) {
    super(owner, args);

    this.args.setAppBarData({ title: this.intl.t('overrideDetails') });
  }

  get dataModel() {
    return this.args.dataModel;
  }

  get showOriginalAndOverriddenSeverity() {
    return (
      !isEmpty(this.dataModel.risk) && !isEmpty(this.dataModel.overriddenRisk)
    );
  }

  get overrideAuditDetails() {
    return [
      {
        label: this.intl.t('editOverrideVulnerability.overriddenOn'),
        icon: 'event',
        value: dayjs(this.dataModel.overriddenOn).format('MMM DD, YYYY'),
      },
      {
        label: this.intl.t('editOverrideVulnerability.overriddenBy'),
        icon: 'account-circle',
        value: this.dataModel.overriddenBy,
      },
      this.showOriginalAndOverriddenSeverity && {
        label: this.intl.t('editOverrideVulnerability.overriddenSeverity'),
        renderValue: true,
      },
    ].filter(Boolean) as OverrideAuditDetail[];
  }

  @action
  overrideCriteriaText(criteria: string | null) {
    switch (criteria) {
      case ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE:
        return this.intl.t('currentFileOnly');

      case ENUMS.ANALYSIS_OVERRIDE_CRITERIA.ALL_FUTURE_UPLOAD:
        return this.intl.t('allFutureAnalyses');

      default:
        return '';
    }
  }

  @action
  handleEditOverrideClick() {
    this.args.setActiveComponent(
      'analysis-risk/override-edit-drawer/override-form'
    );
  }

  @action
  handleResetOverrideClick() {
    this.args.setActiveComponent(
      'analysis-risk/override-edit-drawer/reset-confirm'
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::OverrideDetails': typeof AnalysisRiskOverrideEditDrawerOverrideDetailsComponent;
    'analysis-risk/override-edit-drawer/override-details': typeof AnalysisRiskOverrideEditDrawerOverrideDetailsComponent;
  }
}
