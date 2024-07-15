import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ENUMS from 'irene/enums';
import { metricImpact } from 'irene/helpers/metric-impact';
import { metricVector } from 'irene/helpers/metric-vector';
import { metricScope } from 'irene/helpers/metric-scope';
import { metricInteraction } from 'irene/helpers/metric-interaction';

import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

type CvssMetricOptionData = string | number;
type CvssMetricKeys =
  | 'attackVector'
  | 'attackComplexity'
  | 'privilegesRequired'
  | 'userInteraction'
  | 'scope'
  | 'confidentialityImpact'
  | 'integrityImpact'
  | 'availabilityImpact';

export interface SecurityAnalysisDetailsCvssMetricsComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    updateCVSSScore(): void;
    isInValidCvssBase: boolean;
  };
}

export default class SecurityAnalysisDetailsCvssMetricsComponent extends Component<SecurityAnalysisDetailsCvssMetricsComponentSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare notifications: NotificationService;

  attackVectors = ENUMS.ATTACK_VECTOR.VALUES;
  integrityImpacts = ENUMS.INTEGRITY_IMPACT.VALUES;
  userInteractions = ENUMS.USER_INTERACTION.VALUES;
  attackComplexities = ENUMS.ATTACK_COMPLEXITY.VALUES;
  requiredPrevileges = ENUMS.PRIVILEGES_REQUIRED.VALUES;
  availabilityImpacts = ENUMS.AVAILABILITY_IMPACT.VALUES;
  confidentialityImpacts = ENUMS.CONFIDENTIALITY_IMPACT.VALUES;
  scopes = ENUMS.SCOPE.VALUES;

  get analysis() {
    return this.args.analysis;
  }

  @action getMetricImpact(value: CvssMetricOptionData) {
    return metricImpact([value]);
  }

  @action getMetricVector(value: CvssMetricOptionData) {
    return metricVector([value]);
  }

  @action getMetricScope(value: CvssMetricOptionData) {
    return metricScope([value]);
  }

  @action getMetricInteraction(value: CvssMetricOptionData) {
    return metricInteraction([value]);
  }

  get cvssMetricSelectDataList() {
    return [
      {
        label: 'Attack Vector',
        key: 'attackVector',
        getOptionLabel: this.getMetricVector,
        selected: this.analysis?.attackVector,
        options: this.attackVectors,
        onSelect: this.onMetricSelect('attackVector'),
      },
      {
        label: 'Attack Complexity',
        key: 'attackComplexity',
        getOptionLabel: this.getMetricImpact,
        selected: this.analysis?.attackComplexity,
        options: this.attackComplexities,
        onSelect: this.onMetricSelect('attackComplexity'),
      },
      {
        label: 'Privileges Required',
        key: 'privilegesRequired',
        getOptionLabel: this.getMetricImpact,
        selected: this.analysis?.privilegesRequired,
        options: this.requiredPrevileges,
        onSelect: this.onMetricSelect('privilegesRequired'),
      },
      {
        label: 'User Interaction',
        key: 'userInteraction',
        getOptionLabel: this.getMetricInteraction,
        selected: this.analysis?.userInteraction,
        options: this.userInteractions,
        onSelect: this.onMetricSelect('userInteraction'),
      },
      {
        label: 'Scope',
        key: 'scope',
        getOptionLabel: this.getMetricScope,
        selected: this.analysis?.scope,
        options: this.scopes,
        onSelect: this.onMetricSelect('scope'),
      },

      {
        label: 'Confidentiality Impact',
        key: 'confidentialityImpact',
        getOptionLabel: this.getMetricImpact,
        selected: this.analysis?.confidentialityImpact,
        options: this.confidentialityImpacts,
        onSelect: this.onMetricSelect('confidentialityImpact'),
      },

      {
        label: 'Integrity Impact',
        key: 'integrityImpact',
        getOptionLabel: this.getMetricImpact,
        selected: this.analysis?.integrityImpact,
        options: this.integrityImpacts,
        onSelect: this.onMetricSelect('integrityImpact'),
      },

      {
        label: 'Availability Impact',
        key: 'availabilityImpact',
        getOptionLabel: this.getMetricImpact,
        selected: this.analysis?.availabilityImpact,
        options: this.availabilityImpacts,
        onSelect: this.onMetricSelect('availabilityImpact'),
      },
    ];
  }

  @action onMetricSelect(key: CvssMetricKeys) {
    return (param: CvssMetricOptionData) => {
      this.analysis?.set(key, param);
      this.args.updateCVSSScore();
    };
  }

  @action clearCvss() {
    this.analysis?.setProperties({
      cvssBase: -1.0,
      cvssVector: '',
      attackVector: ENUMS.ATTACK_VECTOR.UNKNOWN,
      attackComplexity: ENUMS.ATTACK_COMPLEXITY.UNKNOWN,
      privilegesRequired: ENUMS.PRIVILEGES_REQUIRED.UNKNOWN,
      userInteraction: ENUMS.USER_INTERACTION.UNKNOWN,
      scope: ENUMS.SCOPE.UNKNOWN,
      confidentialityImpact: ENUMS.CONFIDENTIALITY_IMPACT.UNKNOWN,
      integrityImpact: ENUMS.INTEGRITY_IMPACT.UNKNOWN,
      availabilityImpact: ENUMS.AVAILABILITY_IMPACT.UNKNOWN,
      risk: ENUMS.RISK.UNKNOWN,
    });

    this.args.updateCVSSScore();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::CvssMetrics': typeof SecurityAnalysisDetailsCvssMetricsComponent;
  }
}
