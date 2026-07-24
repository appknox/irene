import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import type {
  SignalData,
  ScoreLevel,
} from 'irene/components/storeknox/fake-apps/findings-signal-row';

import type { SkFakeAppAiScoreLevel } from 'irene/models/sk-fake-app';
import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { FindingsGroupData } from 'irene/components/storeknox/fake-apps/findings-group';

type BadgeType = 'brand' | 'binary' | 'security';
type ResultLabelType = 'match' | 'risk';

/**
 * Converts a percentage score (0–100) to a ScoreLevel.
 */
function percentageScoreToLevel(score: number): ScoreLevel {
  if (score >= 85) {
    return 'high';
  }

  if (score >= 65) {
    return 'medium';
  }

  return 'low';
}

export interface StoreknoxFakeAppsDetailsSignature {
  Args: { fakeApp: SkFakeAppModel; skInventoryApp: SkInventoryAppModel };
}

export default class StoreknoxFakeAppsDetailsComponent extends Component<StoreknoxFakeAppsDetailsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked showIgnoreDrawer = false;
  @tracked selectedSignal: SignalData | null = null;
  @tracked drawerSectionTitle = '';

  BADGE_LABEL_KEYS = {
    brand: {
      high: 'storeknox.fakeApps.highMatch',
      medium: 'storeknox.fakeApps.mediumMatch',
      low: 'storeknox.fakeApps.lowMatch',
    } as const,
    binary: {
      high: 'storeknox.fakeApps.highSimilarity',
      medium: 'storeknox.fakeApps.mediumSimilarity',
      low: 'storeknox.fakeApps.lowSimilarity',
    } as const,
    security: {
      high: 'storeknox.fakeApps.highRisk',
      medium: 'storeknox.fakeApps.potentialRisk',
      low: 'storeknox.fakeApps.lowRisk',
    } as const,
  };

  RESULT_LABEL_KEYS = {
    match: {
      high: 'storeknox.fakeApps.strongMatch',
      medium: 'storeknox.fakeApps.partialMatch',
      low: 'storeknox.fakeApps.lowMatch',
    } as const,
    risk: {
      high: 'storeknox.fakeApps.riskDetected',
      medium: 'storeknox.fakeApps.potentialRisk',
      low: 'storeknox.fakeApps.lowRisk',
    } as const,
  };

  BRAND_IDENTITY_RULES = [
    {
      key: 'SemanticSimilarityRule',
      titleKey: 'storeknox.fakeApps.brandAnalysis',
    },
    {
      key: 'DeveloperConsistencyRule',
      titleKey: 'storeknox.fakeApps.publisherAnalysis',
    },
    {
      key: 'PackageSimilarityRule',
      titleKey: 'storeknox.fakeApps.packageAnalysis',
    },
    {
      key: 'TitleBrandAbuseRule',
      titleKey: 'storeknox.fakeApps.appNameAnalysis',
    },
    {
      key: 'LogoSimilarityRule',
      titleKey: 'storeknox.fakeApps.logoAnalysis',
    },
    {
      key: 'AppFunctionalitySimilarityRule',
      titleKey: 'storeknox.fakeApps.functionalAnalysis',
    },
  ] as const;

  BINARY_SIMILARITY_RULES = [
    {
      key: 'SigningCertRule',
      titleKey: 'storeknox.fakeApps.signingCertAnalysis',
    },
    {
      key: 'CertAttributesRule',
      titleKey: 'storeknox.fakeApps.certAttributesAnalysis',
    },
    {
      key: 'PermissionDeltaRule',
      titleKey: 'storeknox.fakeApps.permissionDeltaAnalysis',
    },
    {
      key: 'ObfuscationRule',
      titleKey: 'storeknox.fakeApps.obfuscationAnalysis',
    },
    {
      key: 'DynamicLoadingRule',
      titleKey: 'storeknox.fakeApps.dynamicLoadingAnalysis',
    },
  ] as const;

  SECURITY_RISK_RULES = [
    {
      key: 'SpecialPermissionsRule',
      titleKey: 'storeknox.fakeApps.specialPermissionsAnalysis',
    },
    {
      key: 'ManifestFlagsRule',
      titleKey: 'storeknox.fakeApps.manifestFlagsAnalysis',
    },
    {
      key: 'PackerDetectionRule',
      titleKey: 'storeknox.fakeApps.packerDetectionAnalysis',
    },
    {
      key: 'EmbeddedFilesRule',
      titleKey: 'storeknox.fakeApps.embeddedFilesAnalysis',
    },
    {
      key: 'NativeLibsRule',
      titleKey: 'storeknox.fakeApps.nativeLibsAnalysis',
    },
    {
      key: 'SuspiciousApiChainsRule',
      titleKey: 'storeknox.fakeApps.suspiciousApiChainsAnalysis',
    },
    {
      key: 'ImplicitIntentsRule',
      titleKey: 'storeknox.fakeApps.implicitIntentsAnalysis',
    },
    {
      key: 'NetworkEndpointsRule',
      titleKey: 'storeknox.fakeApps.networkEndpointsAnalysis',
    },
    {
      key: 'PhishingDomainsRule',
      titleKey: 'storeknox.fakeApps.phishingDomainsAnalysis',
    },
  ] as const;

  get isFakeAppIgnored() {
    return Boolean(this.args.fakeApp?.reviewedBy);
  }

  get isAndroid() {
    return this.args.fakeApp?.isAndroid;
  }

  get isBrandAbuseFakeApp() {
    return this.args.fakeApp?.isBrandAbuse;
  }

  get isFakeApp() {
    return this.args.fakeApp?.isFakeApp;
  }

  get headerTitle() {
    return this.intl.t(
      this.isBrandAbuseFakeApp
        ? 'storeknox.brandAbuse'
        : 'storeknox.fakeApps.fakeApp'
    );
  }

  get overallFindingScoreTitle() {
    return this.intl.t(
      this.isBrandAbuseFakeApp
        ? 'storeknox.fakeApps.suspectedBrandAbuse'
        : 'storeknox.fakeApps.suspectedFakeApps'
    );
  }

  get fakeAppAIScores() {
    return this.args.fakeApp.aiScores;
  }

  get fakeAppAIScoreLevels() {
    return this.args.fakeApp.aiScoreLevels;
  }

  get overallFindingData() {
    return {
      title: this.overallFindingScoreTitle,
      score: this.fakeAppAIScores.final,
      description: this.args.fakeApp.aiClassificationJustification,
      isDefaultFinding: true,
      isIgnored: this.isFakeAppIgnored,
    };
  }

  get brandIdentityGroup() {
    const signals = this.buildSignals(this.BRAND_IDENTITY_RULES, (level) =>
      this.resultLabel(level, 'match')
    );

    const badgeLevel = percentageScoreToLevel(
      this.args.fakeApp.semanticAnalysisScore ?? 0
    );

    return {
      title: this.intl.t('storeknox.fakeApps.brandIdentityAnalysis'),
      description: this.intl.t(
        'storeknox.fakeApps.brandIdentityAnalysisDescription'
      ),
      badge: this.groupBadgeLabel(badgeLevel, 'brand'),
      badgeLevel,
      signals,
    };
  }

  get binarySimilarityGroup() {
    const signals = this.buildSignals(this.BINARY_SIMILARITY_RULES, (level) =>
      this.resultLabel(level, 'match')
    );

    if (signals.length === 0) {
      return null;
    }

    const badgeLevel = percentageScoreToLevel(
      this.args.fakeApp.binarySimilarityScore ?? 0
    );

    return {
      title: this.intl.t('storeknox.fakeApps.binarySimilarityAnalysis'),
      description: this.intl.t(
        'storeknox.fakeApps.binarySimilarityAnalysisDescription'
      ),
      badge: this.groupBadgeLabel(badgeLevel, 'binary'),
      badgeLevel,
      signals,
    };
  }

  get securityRiskGroup(): FindingsGroupData | null {
    const signals = this.buildSignals(this.SECURITY_RISK_RULES, (level) =>
      this.resultLabel(level, 'risk')
    );

    if (signals.length === 0) {
      return null;
    }

    const badgeLevel = percentageScoreToLevel(
      this.args.fakeApp.binaryRiskScore ?? 0
    );

    return {
      title: this.intl.t('storeknox.fakeApps.securityRiskAssessment'),
      description: this.intl.t(
        'storeknox.fakeApps.securityRiskAssessmentDescription'
      ),
      badge: this.groupBadgeLabel(badgeLevel, 'security'),
      badgeLevel,
      signals,
    };
  }

  resultLabel(level: ScoreLevel, type: ResultLabelType) {
    return this.intl.t(this.RESULT_LABEL_KEYS[type][level]);
  }

  groupBadgeLabel(level: ScoreLevel, type: BadgeType) {
    return this.intl.t(this.BADGE_LABEL_KEYS[type][level]);
  }

  makeSignal(
    numericScore: number | undefined,
    apiLevel: SkFakeAppAiScoreLevel | undefined,
    title: string,
    description: string | undefined,
    labelFn: (level: ScoreLevel) => string
  ) {
    if (numericScore == null || apiLevel == null) {
      return null;
    }

    const level = apiLevel.toLowerCase() as ScoreLevel;

    return {
      title,
      result: labelFn(level),
      resultLevel: level,
      description: description ?? '',
      numericScore,
    };
  }

  buildSignals(
    rules:
      | typeof this.BRAND_IDENTITY_RULES
      | typeof this.BINARY_SIMILARITY_RULES
      | typeof this.SECURITY_RISK_RULES,
    labelFn: (level: ScoreLevel) => string
  ) {
    const scores = this.fakeAppAIScores;
    const levels = this.fakeAppAIScoreLevels;

    return rules
      .map(({ key, titleKey }) =>
        this.makeSignal(
          scores[key],
          levels[key],
          this.intl.t(titleKey),
          scores[`${key}_justification`],
          labelFn
        )
      )
      .filter((s) => s !== null)
      .sort((a, b) => b.numericScore - a.numericScore);
  }

  @action
  openDrawer(signal: SignalData, sectionTitle: string) {
    this.selectedSignal = signal;
    this.drawerSectionTitle = sectionTitle;
  }

  @action
  closeDrawer() {
    this.selectedSignal = null;
    this.drawerSectionTitle = '';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::Details': typeof StoreknoxFakeAppsDetailsComponent;
  }
}
