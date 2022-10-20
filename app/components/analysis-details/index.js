import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default class AnalysisDetailsComponent extends Component {
  @service intl;
  @service ajax;
  @service organization;
  @service('notifications') notify;

  @tracked mpClassSelector = true;
  @tracked showVulnerability = false;
  @tracked showEditAnalysisModal = false;
  @tracked markAllAnalyses = false;
  @tracked showResetAnalysisConfirmBox = false;
  @tracked isEditingOverriddenRisk = false;
  @tracked isMarkingAnalysis = false;
  @tracked isResettingMarkedAnalysis = false;
  @tracked markedRisk = this.defaultMarkedRisk;

  tSuccessfullyOverridden = this.intl.t('successfullyOverridden');
  tSuccessfullyReset = this.intl.t('successfullyReset');
  tRiskAndCommentRequired = this.intl.t('riskAndCommentRequired');

  get analysis() {
    return this.args.analysis || null;
  }

  get vulnerability() {
    return this.analysis.vulnerability || null;
  }

  get isManualScanDisabled() {
    return !this.organization.selected.features.manualscan;
  }

  get vulnerabilityTypes() {
    return this.analysis.vulnerabilityTypes;
  }

  get hideManualScanVulnerability() {
    const type = ENUMS.VULNERABILITY_TYPE;
    return (
      this.isManualScanDisabled && this.vulnerabilityTypes.includes(type.MANUAL)
    );
  }

  get risks() {
    const risks = ENUMS.RISK.CHOICES;
    const riskFilter = [ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN];
    return risks.filter((risk) => !riskFilter.includes(risk.value));
  }

  get filteredRisks() {
    const risks = this.risks;
    const analysisRisk = this.analysis.risk;
    return risks.filter((risk) => analysisRisk !== risk.value);
  }

  get defaultMarkedRisk() {
    const filteredRisks = this.filteredRisks;
    return filteredRisks[0].value;
  }

  get statusClass() {
    const status = this.analysis.status;
    if (status === ENUMS.ANALYSIS.WAITING) {
      return 'is-waiting';
    }
    if (status === ENUMS.ANALYSIS.RUNNING) {
      return 'is-progress';
    }
    if (status === ENUMS.ANALYSIS.ERROR) {
      return 'is-errored';
    }
    const risk = this.analysis.computedRisk;
    if (risk === ENUMS.RISK.UNKNOWN) {
      return 'is-untested';
    }
    return 'is-completed';
  }

  get tags() {
    const types = this.vulnerabilityTypes;

    if (types === undefined) {
      return [];
    }
    const tags = [];
    for (let type of Array.from(types)) {
      if (type === ENUMS.VULNERABILITY_TYPE.STATIC) {
        tags.push({
          status: this.analysis.file.get?.('isStaticDone'),
          text: 'static',
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.DYNAMIC) {
        tags.push({
          status: this.analysis.file.get?.('isDynamicDone'),
          text: 'dynamic',
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.MANUAL) {
        tags.push({
          status: this.analysis.file.get?.('isManualDone'),
          text: 'manual',
        });
      }
      if (type === ENUMS.VULNERABILITY_TYPE.API) {
        tags.push({
          status: this.analysis.file.get?.('isApiDone'),
          text: 'api',
        });
      }
    }
    return tags;
  }

  get businessImplication() {
    return htmlSafe(this.vulnerability.get?.('businessImplication'));
  }

  _editAnalysisURL(type) {
    const fileId = this.analysis.file.get?.('id');
    const vulnerabilityId = this.vulnerability.get?.('id');
    const url = [
      ENV.endpoints.files,
      fileId,
      ENV.endpoints.vulnerabilityPreferences,
      vulnerabilityId,
      type,
    ].join('/');
    return url;
  }

  @action openEditAnalysisModal() {
    this.showEditAnalysisModal = true;
  }

  @action confirmCallback() {
    this.resetMarkedAnalysis.perform();
  }

  @action markAnalysis() {
    this.markAnalysisTask.perform();
  }

  @action toggleVulnerability() {
    this.mpClassSelector = this.showVulnerability;
    this.showVulnerability = !this.showVulnerability;
  }

  @action selectMarkedAnalyis(event) {
    const markedRisk = parseInt(event.target.value);
    this.markedRisk = markedRisk;
  }

  @action selectMarkedAnalyisType(event) {
    const markAllAnalyses = event.target.value === 'true';
    this.markAllAnalyses = markAllAnalyses;
  }

  @action removeMarkedAnalysis() {
    this.analysis.overriddenRisk = null;
    this.analysis.overriddenRiskComment = null;
  }

  @action openResetMarkedAnalysisConfirmBox() {
    this.showResetAnalysisConfirmBox = true;
  }

  @action editMarkedAnalysis() {
    this.isEditingOverriddenRisk = true;
  }

  @action cancelEditMarkingAnalysis() {
    this.isEditingOverriddenRisk = false;
  }

  @task(function* () {
    const url = this._editAnalysisURL('risk');
    const data = {
      all: true,
    };
    this.isResettingMarkedAnalysis = true;
    yield this.ajax
      .delete(url, {
        data,
      })
      .then(
        () => {
          if (!this.isDestroyed) {
            this.notify.success(this.tSuccessfullyReset);
            this.isResettingMarkedAnalysis = false;
            this.showResetAnalysisConfirmBox = false;
            this.analysis.computedRisk = this.analysis.risk;
            this.analysis.overriddenRisk = null;
            this.analysis.overriddenRiskComment = null;
          }
        },
        (error) => {
          this.notify.error(error.payload.message);
          this.isResettingMarkedAnalysis = false;
        }
      );
  })
  resetMarkedAnalysis;

  @task(function* () {
    const markedRisk = this.markedRisk;
    const comment = this.analysis.overriddenRiskComment;
    if (!markedRisk || !comment) {
      this.notify.error(this.tRiskAndCommentRequired);
      return;
    }
    const markAllAnalyses = this.markAllAnalyses;
    const url = this._editAnalysisURL('risk');
    const data = {
      risk: markedRisk,
      comment: comment,
      all: markAllAnalyses,
    };
    this.isMarkingAnalysis = true;
    yield this.ajax
      .put(url, {
        data,
      })
      .then(
        () => {
          triggerAnalytics('feature', ENV.csb.editAnalysis);
          if (!this.isDestroyed) {
            this.notify.success(this.tSuccessfullyOverridden);
            this.isMarkingAnalysis = false;
            this.isEditingOverriddenRisk = false;
            this.analysis.overriddenRisk = markedRisk;
            this.analysis.computedRisk = markedRisk;
          }
        },
        (error) => {
          this.notify.error(error.payload.message);
          this.isMarkingAnalysis = false;
        }
      );
  })
  markAnalysisTask;
}
