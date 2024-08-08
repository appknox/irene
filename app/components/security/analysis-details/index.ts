import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';

import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type SecurityAnalysisModel from 'irene/models/security/analysis';

export interface SecurityAnalysisDetailsComponentSignature {
  Args: {
    analysisId: string;
  };
}

export default class SecurityAnalysisDetailsComponent extends Component<SecurityAnalysisDetailsComponentSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare notifications: NotificationService;
  @service declare ajax: any;

  @tracked isInValidCvssBase = false;
  @tracked analysisDetails: SecurityAnalysisModel | null = null;
  @tracked isSaveActionOnly = false;

  constructor(
    owner: unknown,
    args: SecurityAnalysisDetailsComponentSignature['Args']
  ) {
    super(owner, args);

    this.getAnalysisDetails.perform();
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get analysisFile() {
    return this.analysisDetails?.get('file');
  }

  get analysisProjectID() {
    return this.analysisFile?.get('project')?.get('id');
  }

  get breadcrumbItems() {
    if (!this.analysisProjectID) {
      return [];
    }

    return [
      {
        route: 'authenticated.security.projects',
        linkTitle: 'All Projects',
      },
      {
        route: 'authenticated.security.files',
        linkTitle: 'List of Files',
        model: this.analysisProjectID,
      },
      {
        route: 'authenticated.security.file',
        linkTitle: 'File Details',
        model: this.analysisFile?.get('id'),
      },
      {
        route: 'authenticated.security.analysis',
        linkTitle: 'Analysis Details',
        model: this.analysisDetails?.get('id'),
      },
    ].filter(Boolean);
  }

  get isEmptyCvssVector() {
    return (
      this.analysisDetails?.attackVector == ENUMS.ATTACK_VECTOR.UNKNOWN &&
      this.analysisDetails?.attackComplexity ==
        ENUMS.ATTACK_COMPLEXITY.UNKNOWN &&
      this.analysisDetails?.privilegesRequired ==
        ENUMS.PRIVILEGES_REQUIRED.UNKNOWN &&
      this.analysisDetails?.userInteraction == ENUMS.USER_INTERACTION.UNKNOWN &&
      this.analysisDetails?.scope == ENUMS.SCOPE.UNKNOWN &&
      this.analysisDetails?.confidentialityImpact ==
        ENUMS.CONFIDENTIALITY_IMPACT.UNKNOWN &&
      this.analysisDetails?.integrityImpact == ENUMS.INTEGRITY_IMPACT.UNKNOWN &&
      this.analysisDetails?.availabilityImpact ==
        ENUMS.AVAILABILITY_IMPACT.UNKNOWN
    );
  }

  get isValidCvssVector() {
    const isValid =
      ENUMS.ATTACK_VECTOR.BASE_VALUES.includes(
        this.analysisDetails?.attackVector as string
      ) &&
      ENUMS.ATTACK_COMPLEXITY.BASE_VALUES.includes(
        this.analysisDetails?.attackComplexity as string
      ) &&
      ENUMS.PRIVILEGES_REQUIRED.BASE_VALUES.includes(
        this.analysisDetails?.privilegesRequired as string
      ) &&
      ENUMS.USER_INTERACTION.BASE_VALUES.includes(
        this.analysisDetails?.userInteraction as string
      ) &&
      ENUMS.SCOPE.BASE_VALUES.includes(this.analysisDetails?.scope as string) &&
      ENUMS.CONFIDENTIALITY_IMPACT.BASE_VALUES.includes(
        this.analysisDetails?.confidentialityImpact as string
      ) &&
      ENUMS.INTEGRITY_IMPACT.BASE_VALUES.includes(
        this.analysisDetails?.integrityImpact as string
      ) &&
      ENUMS.AVAILABILITY_IMPACT.BASE_VALUES.includes(
        this.analysisDetails?.availabilityImpact as string
      );

    return this.isEmptyCvssVector || isValid;
  }

  @action triggerUpdateCVSSScore() {
    this.updateCVSSScore.perform();
  }

  @action triggerSaveAnalysis(backToFilePage: boolean) {
    this.isSaveActionOnly = !backToFilePage;

    this.saveAnalysis.perform(backToFilePage);
  }

  @action async triggerUpdateAnalysis() {
    return this.updateAnalysis.perform();
  }

  updateCVSSScore = task(async () => {
    if (this.isEmptyCvssVector) {
      this.isInValidCvssBase = false;

      return;
    }

    if (this.isValidCvssVector) {
      const attackVector = this.analysisDetails?.attackVector;
      const attackComplexity = this.analysisDetails?.attackComplexity;
      const privilegesRequired = this.analysisDetails?.privilegesRequired;
      const userInteraction = this.analysisDetails?.userInteraction;
      const scope = this.analysisDetails?.scope;
      const confidentialityImpact = this.analysisDetails?.confidentialityImpact;
      const integrityImpact = this.analysisDetails?.integrityImpact;
      const availabilityImpact = this.analysisDetails?.availabilityImpact;

      const vector = `CVSS:3.0/AV:${attackVector}/AC:${attackComplexity}/PR:${privilegesRequired}/UI:${userInteraction}/S:${scope}/C:${confidentialityImpact}/I:${integrityImpact}/A:${availabilityImpact}`;
      const url = `cvss?vector=${vector}`;

      try {
        const data = await this.ajax.request(url);

        this.analysisDetails?.set('cvssBase', data.cvss_base);
        this.analysisDetails?.set('risk', data.risk);
        this.analysisDetails?.set('cvssVector', vector);

        this.isInValidCvssBase = false;
      } catch (error) {
        this.notifications.error(this.tPleaseTryAgain);
      }

      return;
    }

    this.isInValidCvssBase = true;
  });

  saveAnalysis = task(async (backToFilePage = false) => {
    try {
      await this.updateAnalysis.perform();

      if (backToFilePage) {
        this.router.transitionTo(
          'authenticated.security.file',
          this.analysisDetails?.file.get('id') as string
        );
      }

      this.notifications.success('Analysis Updated');
    } catch (err) {
      this.notifications.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  updateAnalysis = task(async () => {
    const isValidCvssVector = this.isValidCvssVector;

    if (!isValidCvssVector) {
      throw new Error('Invalid CVSS metrics');
    }

    const risk = this.analysisDetails?.risk;
    const owasp = this.analysisDetails?.owasp;
    const owaspmobile2024 = this.analysisDetails?.owaspmobile2024;
    const owaspapi2023 = this.analysisDetails?.owaspapi2023;
    const pcidss = this.analysisDetails?.pcidss;
    const hipaa = this.analysisDetails?.hipaa;
    const masvs = this.analysisDetails?.masvs;
    const mstg = this.analysisDetails?.mstg;
    const asvs = this.analysisDetails?.asvs;
    const cwe = this.analysisDetails?.cwe;
    const gdpr = this.analysisDetails?.gdpr;
    const nistsp800171 = this.analysisDetails?.nistsp800171;
    const nistsp80053 = this.analysisDetails?.nistsp80053;
    const sama = this.analysisDetails?.sama;

    const status = this.analysisDetails?.status as number | { value: number };

    if (typeof status === 'object') {
      this.analysisDetails?.set('status', status.value);
    }

    const analysisid = this.args.analysisId;
    const findings = this.analysisDetails?.findings;

    let overriddenRisk = this.analysisDetails?.overriddenRisk as
      | number
      | { value: number };

    if (typeof overriddenRisk === 'object' && !isEmpty(overriddenRisk)) {
      overriddenRisk = overriddenRisk.value;
    }

    const data = {
      risk,
      status,
      owasp: owasp?.map((a) => a.id),
      owaspmobile2024: owaspmobile2024?.map((a) => a.id),
      owaspapi2023: owaspapi2023?.map((a) => a.id),
      pcidss: pcidss?.map((a) => a.id),
      hipaa: hipaa?.map((a) => a.id),
      mstg: mstg?.map((a) => a.id),
      masvs: masvs?.map((a) => a.id),
      asvs: asvs?.map((a) => a.id),
      cwe: cwe?.map((a) => a.id),
      gdpr: gdpr?.map((a) => a.id),
      findings,
      nistsp80053: nistsp80053?.map((a) => a.id),
      nistsp800171: nistsp800171?.map((a) => a.id),
      sama: sama?.map((a) => a.id),
      overridden_risk: overriddenRisk,
      overridden_risk_comment: this.analysisDetails?.overriddenRiskComment,
      overridden_risk_to_profile: this.analysisDetails?.overriddenRiskToProfile,
      cvss_vector: this.analysisDetails?.cvssVector,
      attack_vector: this.analysisDetails?.attackVector,
      attack_complexity: this.analysisDetails?.attackComplexity,
      privileges_required: this.analysisDetails?.privilegesRequired,
      user_interaction: this.analysisDetails?.userInteraction,
      scope: this.analysisDetails?.scope,
      confidentiality_impact: this.analysisDetails?.confidentialityImpact,
      integrity_impact: this.analysisDetails?.integrityImpact,
      availability_impact: this.analysisDetails?.availabilityImpact,
    };

    const url = [ENV.endpoints['analyses'], analysisid].join('/');

    return await this.ajax.put(url, {
      namespace: 'api/hudson-api',
      data: JSON.stringify(data),
      contentType: 'application/json',
    });
  });

  getAnalysisDetails = task(async () => {
    try {
      this.analysisDetails = await this.store.findRecord(
        'security/analysis',
        this.args.analysisId
      );
    } catch (error) {
      this.notifications.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails': typeof SecurityAnalysisDetailsComponent;
  }
}
