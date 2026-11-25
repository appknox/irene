import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type KnowledgeBaseService from 'irene/services/knowledge-base';

interface TopNavKnowledgeBaseSignature {
  Element: HTMLElement;
  Args: { triggerBtnClass?: string };
}

export default class TopNavKnowledgeBaseComponent extends Component<TopNavKnowledgeBaseSignature> {
  @service declare knowledgeBase: KnowledgeBaseService;

  @action
  onOpenKnowledgeBase() {
    this.knowledgeBase.open();
  }

  @action
  handleClosePanel() {
    this.knowledgeBase.closePanel();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase': typeof TopNavKnowledgeBaseComponent;
  }
}
