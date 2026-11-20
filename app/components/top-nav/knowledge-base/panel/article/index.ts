import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

import type { KnowledgeBaseArticle } from 'irene/components/top-nav/knowledge-base/panel';

export interface TopNavKnowledgeBasePanelArticleSignature {
  Args: { article: KnowledgeBaseArticle };
}

export default class TopNavKnowledgeBasePanelArticleComponent extends Component<TopNavKnowledgeBasePanelArticleSignature> {
  @service('browser/window') declare window: Window;

  // mycroft sanitizes the article HTML before serving it (hubspot_kb.py).
  get body() {
    return htmlSafe(this.args.article.body);
  }

  @action
  handleBodyClick(event: MouseEvent) {
    const container = event.currentTarget as HTMLElement;
    const link = (event.target as HTMLElement).closest('a');
    const href = link?.getAttribute('href');

    if (!link || !href) {
      return;
    }

    event.preventDefault();

    if (href.startsWith('#')) {
      const target = container.querySelector(
        `[id="${CSS.escape(decodeURIComponent(href.slice(1)))}"]`
      );

      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      return;
    }

    this.window.open(link.href, '_blank', 'noopener,noreferrer');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase::Panel::Article': typeof TopNavKnowledgeBasePanelArticleComponent;
  }
}
