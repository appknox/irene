import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import type SkFakeAppModel from 'irene/models/sk-fake-app';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

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

  get fakeAppFindingsCategoryData() {
    return [
      {
        title: 'Overall Score',
        score: this.args.fakeApp.aiConfidence,
        description: this.args.fakeApp.aiClassificationJustification,
        isDefaultFinding: true,
        isIgnored: this.isFakeAppIgnored,
      },
      {
        title: 'Semantic Similarity',
        score: this.fakeAppAIScores.SemanticSimilarityRule,
        description: this.fakeAppAIScores.SemanticSimilarityRule_justification,
        isSemanticFinding: true,
      },
      {
        title: 'Logo Similarity',
        score: this.fakeAppAIScores.LogoSimilarityRule,
        description: this.fakeAppAIScores.LogoSimilarityRule_justification,
      },
      {
        title: 'Title Brand Abuse',
        score: this.fakeAppAIScores.TitleBrandAbuseRule,
        description: this.fakeAppAIScores.TitleBrandAbuseRule_justification,
      },
      {
        title: 'Package Similarity',
        score: this.fakeAppAIScores.PackageSimilarityRule,
        description: this.fakeAppAIScores.PackageSimilarityRule_justification,
      },

      {
        title: 'Developer Consistency',
        score: this.fakeAppAIScores.DeveloperConsistencyRule,
        description:
          this.fakeAppAIScores.DeveloperConsistencyRule_justification,
      },
      {
        title: 'App Functionality Similarity',
        score: this.fakeAppAIScores.AppFunctionalitySimilarityRule,
        description:
          this.fakeAppAIScores.AppFunctionalitySimilarityRule_justification,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::Details': typeof StoreknoxFakeAppsDetailsComponent;
  }
}
