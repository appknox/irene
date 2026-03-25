import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

type FakeAppFindingScoreData = {
  title: string;
  info?: string;
  numericScore?: number;
  score: number | string;
  description: string;
  isDefaultFinding?: boolean;
  isIgnored?: boolean;
};

export interface StoreknoxFakeAppsDetailsSignature {
  Args: { fakeApp: SkFakeAppModel; skInventoryApp: SkInventoryAppModel };
}

export default class StoreknoxFakeAppsDetailsComponent extends Component<StoreknoxFakeAppsDetailsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked showIgnoreDrawer = false;

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

  get fakeAppAIScores() {
    return this.args.fakeApp.aiScores;
  }

  get fakeAppAIScoreLevels() {
    return this.args.fakeApp.aiScoreLevels;
  }

  get fakeAppFindingsCategoryData() {
    const overallCard = {
      title: this.intl.t('storeknox.fakeApps.overallScore'),
      info: this.intl.t('storeknox.fakeApps.overallScoreInfo'),
      score: this.fakeAppAIScores.final,
      description: this.args.fakeApp.aiClassificationJustification,
      isDefaultFinding: true,
      isIgnored: this.isFakeAppIgnored,
    };

    const levelCards = (
      [
        this.fakeAppAIScores.SemanticSimilarityRule && {
          numericScore: this.fakeAppAIScores.SemanticSimilarityRule,
          title: this.intl.t('storeknox.fakeApps.brandAnalysis'),
          info: this.intl.t('storeknox.fakeApps.brandAnalysisInfo'),
          score: this.fakeAppAIScoreLevels.SemanticSimilarityRule,
          description:
            this.fakeAppAIScores.SemanticSimilarityRule_justification,
        },
        this.fakeAppAIScores.LogoSimilarityRule && {
          numericScore: this.fakeAppAIScores.LogoSimilarityRule,
          title: this.intl.t('storeknox.fakeApps.logoAnalysis'),
          info: this.intl.t('storeknox.fakeApps.logoAnalysisInfo'),
          score: this.fakeAppAIScoreLevels.LogoSimilarityRule,
          description: this.fakeAppAIScores.LogoSimilarityRule_justification,
        },
        this.fakeAppAIScores.TitleBrandAbuseRule && {
          numericScore: this.fakeAppAIScores.TitleBrandAbuseRule,
          title: this.intl.t('storeknox.fakeApps.appNameAnalysis'),
          info: this.intl.t('storeknox.fakeApps.appNameAnalysisInfo'),
          score: this.fakeAppAIScoreLevels.TitleBrandAbuseRule,
          description: this.fakeAppAIScores.TitleBrandAbuseRule_justification,
        },
        this.fakeAppAIScores.PackageSimilarityRule && {
          numericScore: this.fakeAppAIScores.PackageSimilarityRule,
          title: this.intl.t('storeknox.fakeApps.packageAnalysis'),
          info: this.intl.t('storeknox.fakeApps.packageAnalysisInfo'),
          score: this.fakeAppAIScoreLevels.PackageSimilarityRule,
          description: this.fakeAppAIScores.PackageSimilarityRule_justification,
        },
        this.fakeAppAIScores.DeveloperConsistencyRule && {
          numericScore: this.fakeAppAIScores.DeveloperConsistencyRule,
          title: this.intl.t('storeknox.fakeApps.publisherAnalysis'),
          info: this.intl.t('storeknox.fakeApps.publisherAnalysisInfo'),
          score: this.fakeAppAIScoreLevels.DeveloperConsistencyRule,
          description:
            this.fakeAppAIScores.DeveloperConsistencyRule_justification,
        },
        this.fakeAppAIScores.AppFunctionalitySimilarityRule && {
          numericScore: this.fakeAppAIScores.AppFunctionalitySimilarityRule,
          title: this.intl.t('storeknox.fakeApps.functionalAnalysis'),
          info: this.intl.t('storeknox.fakeApps.functionalAnalysisInfo'),
          score: this.fakeAppAIScoreLevels.AppFunctionalitySimilarityRule,
          description:
            this.fakeAppAIScores.AppFunctionalitySimilarityRule_justification,
        },
      ] as Array<FakeAppFindingScoreData | undefined>
    )
      .filter((item): item is FakeAppFindingScoreData => item != null)
      .sort((a, b) => (b.numericScore ?? 0) - (a.numericScore ?? 0));

    return [overallCard, ...levelCards];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::Details': typeof StoreknoxFakeAppsDetailsComponent;
  }
}
