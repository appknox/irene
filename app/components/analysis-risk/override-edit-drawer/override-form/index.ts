import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import { BufferedChangeset } from 'ember-changeset/types';
import { validatePresence } from 'ember-changeset-validations/validators';
import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';
import { AnalysisRiskDataModel, OverrideEditDrawerAppBarData } from '..';
import { ActiveContentComponent } from '../content';
import parseError from 'irene/utils/parse-error';
import type AnalysisModel from 'irene/models/analysis';
import type AnalyticsService from 'irene/services/analytics';

type ChangesetBufferProps = BufferedChangeset & {
  risk: number;
  criteria: string;
  comment: string;
};

const ChangeValidator = {
  risk: [validatePresence(true)],
  criteria: [validatePresence(true)],
  comment: [validatePresence(true)],
};

export interface AnalysisRiskOverrideEditDrawerOverrideFormSignature {
  Args: {
    dataModel: AnalysisRiskDataModel;
    setActiveComponent: (component: ActiveContentComponent) => void;
    setAppBarData: (appBarData: OverrideEditDrawerAppBarData) => void;
    drawerCloseHandler?: () => void;
  };
}

type RiskValue = { key: string; value: number | string };
type RiskOverrideCriteria = { label: string; value: string };

export default class AnalysisRiskOverrideEditDrawerOverrideFormComponent extends Component<AnalysisRiskOverrideEditDrawerOverrideFormSignature> {
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked showOverrideSuccess = false;
  @tracked isEditingExistingOverride = false;
  @tracked changeset: ChangesetBufferProps | null = null;

  model = {};

  constructor(
    owner: unknown,
    args: AnalysisRiskOverrideEditDrawerOverrideFormSignature['Args']
  ) {
    super(owner, args);

    // if overridden then form must have been triggered through edit button
    this.isEditingExistingOverride = Boolean(this.dataModel.isOverridden);

    this.setAppBarData();

    this.model = this.getInitialFormValues();

    this.changeset = Changeset(
      this.model,
      lookupValidator(ChangeValidator),
      ChangeValidator
    ) as ChangesetBufferProps;
  }

  get dataModel() {
    return this.args.dataModel || null;
  }

  get filteredRisks() {
    const risks = this.risks;
    const analysisRisk = this.dataModel.risk;

    return risks
      .filter((risk) => analysisRisk !== risk.value)
      .sort((a, b) => (b.value as number) - (a.value as number));
  }

  get risks(): RiskValue[] {
    const risks = ENUMS.RISK.CHOICES;
    const riskFilter = [ENUMS.RISK.UNKNOWN];

    return risks.filter((risk) => !riskFilter.includes(risk.value as number));
  }

  get isIgnoreVulnerabilitySelected() {
    return this.changeset?.risk === ENUMS.RISK.NONE;
  }

  get overrideRiskForOptions() {
    return this.args.dataModel.overrideCriteriaOptions;
  }

  get criteriaTextIfSingleOption() {
    if (this.overrideRiskForOptions.length === 1) {
      return this.overrideRiskForOptions[0]?.label;
    }

    return null;
  }

  get selectedRiskToOverride() {
    return this.filteredRisks.find((it) => this.changeset?.risk === it.value);
  }

  get selectedOverrideCriteria() {
    return this.overrideRiskForOptions.find(
      (it) => this.changeset?.criteria === it.value
    );
  }

  get riskOrCriteriaSelectValidationMessage() {
    if (this.changeset?.error['risk'] && this.changeset?.error['criteria']) {
      return this.intl.t(
        'editOverrideVulnerability.emptySeverityCriteriaErrorText'
      );
    }

    if (this.changeset?.error['risk']) {
      return this.intl.t('editOverrideVulnerability.emptySeverityErrorText');
    }

    if (this.changeset?.error['criteria']) {
      return this.intl.t('editOverrideVulnerability.emptyCriteriaErrorText');
    }

    return null;
  }

  setAppBarData() {
    const appBarData: OverrideEditDrawerAppBarData = {
      title: this.intl.t('editAnalysis'),
    };

    if (this.isEditingExistingOverride) {
      appBarData.onBackClick = this.handleBackToOverrideDetails;
    }

    this.args.setAppBarData(appBarData);
  }

  getInitialFormValues() {
    const dataModel = this.args.dataModel;

    const risk =
      this.filteredRisks.find((it) => it.value === dataModel.overriddenRisk) ||
      null;

    const hasSingleCriteriaOption = this.overrideRiskForOptions.length === 1;

    const criteria = hasSingleCriteriaOption
      ? this.overrideRiskForOptions[0]
      : this.overrideRiskForOptions.find(
          (it) => it.value === dataModel.overrideCriteria
        );

    return {
      risk: risk?.value ?? null,
      criteria: criteria?.value ?? null,
      comment: dataModel.overriddenRiskComment,
    };
  }

  @action
  isObjectTruthy(errorObject?: object) {
    return Boolean(errorObject);
  }

  @action
  handleBackToOverrideDetails() {
    this.args.setActiveComponent(
      'analysis-risk/override-edit-drawer/override-details'
    );
  }

  @action
  riskSelectOptionLabel(value: string | number) {
    return value === ENUMS.RISK.NONE
      ? this.intl.t('ignoreVulnerability')
      : this.intl.t(riskText([value]) as string);
  }

  @action
  markAnalysis() {
    this.editSaveOverrideHandlerTask.perform();
  }

  @action
  handleOverrideRiskChange(risk: RiskValue) {
    this.changeset?.set('risk', risk.value);
  }

  @action
  handleOverrideCriteriaChange(overrideCriteria: RiskOverrideCriteria) {
    this.changeset?.set('criteria', overrideCriteria.value);
  }

  @action
  handleEditOverriddenRiskCancel() {
    if (this.isEditingExistingOverride) {
      this.handleBackToOverrideDetails();
    } else {
      this.args.drawerCloseHandler?.();
    }
  }

  @action
  handleOverrideSuccess() {
    if (this.isEditingExistingOverride) {
      this.args.setActiveComponent(
        'analysis-risk/override-edit-drawer/override-details'
      );
    } else {
      this.showOverrideSuccess = true;

      this.args.setAppBarData({ title: this.intl.t('successMessage') });
    }
  }

  editSaveOverrideHandlerTask = task(async () => {
    await this.changeset?.validate();

    if (this.changeset?.isInvalid) {
      return;
    }

    // Prevent saving overrides for deprecated/inactive vulnerabilities
    const vulnerability = (this.dataModel.model as AnalysisModel)?.get(
      'vulnerability'
    );

    if (vulnerability?.get?.('isActive') === false) {
      this.notify.error(this.intl.t('vulnerabilityDeprecatedReadonly'));

      return;
    }

    try {
      const comment = this.changeset?.comment;
      const riskOverride = this.changeset?.risk;

      const all =
        this.changeset?.criteria ===
        ENUMS.ANALYSIS_OVERRIDE_CRITERIA.ALL_FUTURE_UPLOAD;

      await this.dataModel.editSaveOverrideHandler(
        riskOverride as number,
        comment as string,
        all
      );

      this.analytics.track({
        name: 'RISK_OVERRIDE_EVENT',
        properties: {
          feature: this.isEditingExistingOverride
            ? 'edit_risk_override'
            : 'create_risk_override',
          analysisId: this.dataModel.model.id,
          overriddenRisk: riskOverride,
          overrideCriteria: this.changeset?.criteria,
        },
      });

      if (!this.isDestroyed) {
        this.handleOverrideSuccess();
      }
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::OverrideForm': typeof AnalysisRiskOverrideEditDrawerOverrideFormComponent;
    'analysis-risk/override-edit-drawer/override-form': typeof AnalysisRiskOverrideEditDrawerOverrideFormComponent;
  }
}
