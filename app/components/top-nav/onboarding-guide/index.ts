import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { runTask } from 'ember-lifeline';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

export interface GuideItem {
  id: string;
  title: string;
  url: string;
}

interface TopNavOnboardingGuideSignature {
  Args: {
    onClose: () => void;
    guideCategories: Array<{
      category: string;
      guides: GuideItem[];
    }>;
  };
}

export default class TopNavOnboardingGuide extends Component<TopNavOnboardingGuideSignature> {
  @service declare intl: IntlService;

  @tracked activeGuide: GuideItem | null = null;
  @tracked mountIFrame = true;

  constructor(owner: unknown, args: TopNavOnboardingGuideSignature['Args']) {
    super(owner, args);

    this.activeGuide = this.guidesList[0]?.guides[0] ?? null;
  }

  get selectedGuideUrl(): string | null {
    return this.activeGuide?.url || null;
  }

  get selectedGuideId(): string | null {
    return this.activeGuide?.id || null;
  }

  get guidesList() {
    return this.args.guideCategories;
  }

  @action
  setActiveGuide(guide: GuideItem) {
    this.mountIFrame = false;
    this.activeGuide = guide;

    this.handleIframeInsertion();
  }

  @action
  handleIframeInsertion() {
    runTask(this, () => {
      this.mountIFrame = true;
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::OnboardingGuide': typeof TopNavOnboardingGuide;
  }
}
