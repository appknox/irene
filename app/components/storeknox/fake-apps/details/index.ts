import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { SkFakeAppAiScoreLevel } from 'irene/models/sk-fake-app';
import type { FindingsGroupData } from 'irene/components/storeknox/fake-apps/findings-group';
import type {
  SignalData,
  ScoreLevel,
} from 'irene/components/storeknox/fake-apps/findings-signal-row';

type OverallFindingData = {
  title: string;
  score: number;
  description: string;
  isDefaultFinding: true;
  isIgnored?: boolean;
};

export interface StoreknoxFakeAppsDetailsSignature {
  Args: { fakeApp: SkFakeAppModel; skInventoryApp: SkInventoryAppModel };
}

function percentageScoreToLevel(score: number): ScoreLevel {
  if (score >= 85) {
    return 'high';
  }
  if (score >= 65) {
    return 'medium';
  }
  return 'low';
}

export default class StoreknoxFakeAppsDetailsComponent extends Component<StoreknoxFakeAppsDetailsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked showIgnoreDrawer = false;
  @tracked selectedSignal: SignalData | null = null;
  @tracked drawerSectionTitle = '';

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

  get overallFindingData(): OverallFindingData {
    return {
      title: this.overallFindingScoreTitle,
      score: this.fakeAppAIScores.final,
      description: this.args.fakeApp.aiClassificationJustification,
      isDefaultFinding: true,
      isIgnored: this.isFakeAppIgnored,
    };
  }

  matchResultLabel(level: ScoreLevel) {
    const map: Record<ScoreLevel, string> = {
      high: this.intl.t('storeknox.fakeApps.strongMatch'),
      medium: this.intl.t('storeknox.fakeApps.partialMatch'),
      low: this.intl.t('storeknox.fakeApps.noMatch'),
    };
    return map[level];
  }

  riskResultLabel(level: ScoreLevel): string {
    const map: Record<ScoreLevel, string> = {
      high: this.intl.t('storeknox.fakeApps.riskDetected'),
      medium: this.intl.t('storeknox.fakeApps.potentialRisk'),
      low: this.intl.t('storeknox.fakeApps.noRiskDetected'),
    };
    return map[level];
  }

  makeSignal(
    numericScore: number | undefined,
    apiLevel: SkFakeAppAiScoreLevel | undefined,
    title: string,
    description: string | undefined,
    labelFn: (level: ScoreLevel) => string
  ): SignalData | null {
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

  groupBadgeLabel(level: ScoreLevel, type: 'brand' | 'binary' | 'security') {
    if (type === 'brand') {
      const map: Record<ScoreLevel, string> = {
        high: this.intl.t('storeknox.fakeApps.highMatch'),
        medium: this.intl.t('storeknox.fakeApps.mediumMatch'),
        low: this.intl.t('storeknox.fakeApps.lowMatch'),
      };
      return map[level];
    } else if (type === 'binary') {
      const map: Record<ScoreLevel, string> = {
        high: this.intl.t('storeknox.fakeApps.highSimilarity'),
        medium: this.intl.t('storeknox.fakeApps.mediumSimilarity'),
        low: this.intl.t('storeknox.fakeApps.lowSimilarity'),
      };
      return map[level];
    } else {
      const map: Record<ScoreLevel, string> = {
        high: this.intl.t('storeknox.fakeApps.highRisk'),
        medium: this.intl.t('storeknox.fakeApps.potentialRisk'),
        low: this.intl.t('storeknox.fakeApps.lowRisk'),
      };
      return map[level];
    }
  }

  get brandIdentityGroup(): FindingsGroupData {
    const scores = this.fakeAppAIScores;
    const levels = this.fakeAppAIScoreLevels;
    const matchLabel = (l: ScoreLevel) => this.matchResultLabel(l);

    const signals = (
      [
        this.makeSignal(
          scores.SemanticSimilarityRule,
          levels.SemanticSimilarityRule,
          this.intl.t('storeknox.fakeApps.brandAnalysis'),
          scores.SemanticSimilarityRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.DeveloperConsistencyRule,
          levels.DeveloperConsistencyRule,
          this.intl.t('storeknox.fakeApps.publisherAnalysis'),
          scores.DeveloperConsistencyRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.PackageSimilarityRule,
          levels.PackageSimilarityRule,
          this.intl.t('storeknox.fakeApps.packageAnalysis'),
          scores.PackageSimilarityRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.TitleBrandAbuseRule,
          levels.TitleBrandAbuseRule,
          this.intl.t('storeknox.fakeApps.appNameAnalysis'),
          scores.TitleBrandAbuseRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.LogoSimilarityRule,
          levels.LogoSimilarityRule,
          this.intl.t('storeknox.fakeApps.logoAnalysis'),
          scores.LogoSimilarityRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.AppFunctionalitySimilarityRule,
          levels.AppFunctionalitySimilarityRule,
          this.intl.t('storeknox.fakeApps.functionalAnalysis'),
          scores.AppFunctionalitySimilarityRule_justification,
          matchLabel
        ),
      ] as Array<SignalData | null>
    )
      .filter((s): s is SignalData => s !== null)
      .sort((a, b) => b.numericScore - a.numericScore);

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

  get binarySimilarityGroup(): FindingsGroupData | null {
    const scores = this.fakeAppAIScores;
    const levels = this.fakeAppAIScoreLevels;
    const matchLabel = (l: ScoreLevel) => this.matchResultLabel(l);

    const signals = (
      [
        this.makeSignal(
          scores.SigningCertRule,
          levels.SigningCertRule,
          this.intl.t('storeknox.fakeApps.signingCertAnalysis'),
          scores.SigningCertRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.CertAttributesRule,
          levels.CertAttributesRule,
          this.intl.t('storeknox.fakeApps.certAttributesAnalysis'),
          scores.CertAttributesRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.PermissionDeltaRule,
          levels.PermissionDeltaRule,
          this.intl.t('storeknox.fakeApps.permissionDeltaAnalysis'),
          scores.PermissionDeltaRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.ObfuscationRule,
          levels.ObfuscationRule,
          this.intl.t('storeknox.fakeApps.obfuscationAnalysis'),
          scores.ObfuscationRule_justification,
          matchLabel
        ),
        this.makeSignal(
          scores.DynamicLoadingRule,
          levels.DynamicLoadingRule,
          this.intl.t('storeknox.fakeApps.dynamicLoadingAnalysis'),
          scores.DynamicLoadingRule_justification,
          matchLabel
        ),
      ] as Array<SignalData | null>
    )
      .filter((s): s is SignalData => s !== null)
      .sort((a, b) => b.numericScore - a.numericScore);

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
    const scores = this.fakeAppAIScores;
    const levels = this.fakeAppAIScoreLevels;
    const riskLabel = (l: ScoreLevel) => this.riskResultLabel(l);

    const signals = (
      [
        this.makeSignal(
          scores.SpecialPermissionsRule,
          levels.SpecialPermissionsRule,
          this.intl.t('storeknox.fakeApps.specialPermissionsAnalysis'),
          scores.SpecialPermissionsRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.ManifestFlagsRule,
          levels.ManifestFlagsRule,
          this.intl.t('storeknox.fakeApps.manifestFlagsAnalysis'),
          scores.ManifestFlagsRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.PackerDetectionRule,
          levels.PackerDetectionRule,
          this.intl.t('storeknox.fakeApps.packerDetectionAnalysis'),
          scores.PackerDetectionRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.EmbeddedFilesRule,
          levels.EmbeddedFilesRule,
          this.intl.t('storeknox.fakeApps.embeddedFilesAnalysis'),
          scores.EmbeddedFilesRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.NativeLibsRule,
          levels.NativeLibsRule,
          this.intl.t('storeknox.fakeApps.nativeLibsAnalysis'),
          scores.NativeLibsRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.SuspiciousApiChainsRule,
          levels.SuspiciousApiChainsRule,
          this.intl.t('storeknox.fakeApps.suspiciousApiChainsAnalysis'),
          scores.SuspiciousApiChainsRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.ImplicitIntentsRule,
          levels.ImplicitIntentsRule,
          this.intl.t('storeknox.fakeApps.implicitIntentsAnalysis'),
          scores.ImplicitIntentsRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.NetworkEndpointsRule,
          levels.NetworkEndpointsRule,
          this.intl.t('storeknox.fakeApps.networkEndpointsAnalysis'),
          scores.NetworkEndpointsRule_justification,
          riskLabel
        ),
        this.makeSignal(
          scores.PhishingDomainsRule,
          levels.PhishingDomainsRule,
          this.intl.t('storeknox.fakeApps.phishingDomainsAnalysis'),
          scores.PhishingDomainsRule_justification,
          riskLabel
        ),
      ] as Array<SignalData | null>
    )
      .filter((s): s is SignalData => s !== null)
      .sort((a, b) => b.numericScore - a.numericScore);

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
