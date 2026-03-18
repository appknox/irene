import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

type FakeAppFindingScoreData = {
  title: string;
  score: number;
  description: string;
  isDefaultFinding?: boolean;
  isSemanticFinding?: boolean;
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
    return [
      {
        title: this.intl.t('storeknox.fakeApps.overallScore'),
        score: this.fakeAppAIScores.final,
        description: this.args.fakeApp.aiClassificationJustification,
        isDefaultFinding: true,
        isIgnored: this.isFakeAppIgnored,
      },
      this.fakeAppAIScores.SemanticSimilarityRule && {
        title: this.intl.t('storeknox.fakeApps.semanticSimilarity'),
        score: this.fakeAppAIScoreLevels.SemanticSimilarityRule,
        description: this.fakeAppAIScores.SemanticSimilarityRule_justification,
        isSemanticFinding: true,
      },
      this.fakeAppAIScores.LogoSimilarityRule && {
        title: this.intl.t('storeknox.fakeApps.logoSimilarity'),
        score: this.fakeAppAIScoreLevels.LogoSimilarityRule,
        description: this.fakeAppAIScores.LogoSimilarityRule_justification,
      },
      this.fakeAppAIScores.TitleBrandAbuseRule && {
        title: this.intl.t('storeknox.fakeApps.titleBrandAbuse'),
        score: this.fakeAppAIScoreLevels.TitleBrandAbuseRule,
        description: this.fakeAppAIScores.TitleBrandAbuseRule_justification,
      },
      this.fakeAppAIScores.PackageSimilarityRule && {
        title: this.intl.t('storeknox.fakeApps.packageSimilarity'),
        score: this.fakeAppAIScoreLevels.PackageSimilarityRule,
        description: this.fakeAppAIScores.PackageSimilarityRule_justification,
      },

      this.fakeAppAIScores.DeveloperConsistencyRule && {
        title: this.intl.t('storeknox.fakeApps.developerConsistency'),
        score: this.fakeAppAIScoreLevels.DeveloperConsistencyRule,
        description:
          this.fakeAppAIScores.DeveloperConsistencyRule_justification,
      },
      this.fakeAppAIScores.AppFunctionalitySimilarityRule && {
        title: this.intl.t('storeknox.fakeApps.appFunctionalitySimilarity'),
        score: this.fakeAppAIScoreLevels.AppFunctionalitySimilarityRule,
        description:
          this.fakeAppAIScores.AppFunctionalitySimilarityRule_justification,
      },
    ].filter(Boolean) as FakeAppFindingScoreData[];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::Details': typeof StoreknoxFakeAppsDetailsComponent;
  }
}
