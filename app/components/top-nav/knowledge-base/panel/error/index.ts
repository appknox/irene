import Component from '@glimmer/component';

export interface TopNavKnowledgeBasePanelErrorSignature {
  Element: HTMLDivElement;
}

export default class TopNavKnowledgeBasePanelErrorComponent extends Component<TopNavKnowledgeBasePanelErrorSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase::Panel::Error': typeof TopNavKnowledgeBasePanelErrorComponent;
  }
}
