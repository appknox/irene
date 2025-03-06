import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type FreshdeskService from 'irene/services/freshdesk';

interface TopNavKnowledgeBaseSignature {
  Args: { triggerBtnClass?: string };
}

export default class TopNavKnowledgeBaseComponent extends Component<TopNavKnowledgeBaseSignature> {
  @service declare freshdesk: FreshdeskService;

  get showKnowledgeBase() {
    return this.freshdesk.supportWidgetIsEnabled;
  }

  @action
  onOpenKnowledgeBase() {
    this.freshdesk.openSupportWidget();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase': typeof TopNavKnowledgeBaseComponent;
  }
}
