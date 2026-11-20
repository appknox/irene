import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type FreshdeskService from 'irene/services/freshdesk';
import type KnowledgeBaseService from 'irene/services/knowledge-base';

interface TopNavKnowledgeBaseSignature {
  Args: { triggerBtnClass?: string };
}

export default class TopNavKnowledgeBaseComponent extends Component<TopNavKnowledgeBaseSignature> {
  @service declare freshdesk: FreshdeskService;
  @service declare knowledgeBase: KnowledgeBaseService;

  get showKnowledgeBase() {
    return (
      this.knowledgeBase.isAvailable || this.freshdesk.supportWidgetIsEnabled
    );
  }

  @action
  onOpenKnowledgeBase() {
    if (this.knowledgeBase.isAvailable) {
      this.knowledgeBase.open();

      return;
    }

    this.freshdesk.openSupportWidget();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase': typeof TopNavKnowledgeBaseComponent;
  }
}
