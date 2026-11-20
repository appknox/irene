import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

import type { KnowledgeBaseArticle } from 'irene/components/top-nav/knowledge-base/panel';

export interface TopNavKnowledgeBasePanelArticleSignature {
  Element: HTMLElement;
  Args: { article: KnowledgeBaseArticle };
}

export default class TopNavKnowledgeBasePanelArticleComponent extends Component<TopNavKnowledgeBasePanelArticleSignature> {
  @service('browser/window') declare window: Window;

  // mycroft sanitizes the article HTML before serving it (hubspot_kb.py).
  get body() {
    return htmlSafe(this.args.article.body);
  }

  scrollToAnchor(container: HTMLElement, anchor: string) {
    let id = anchor;

    try {
      id = decodeURIComponent(anchor);
    } catch {
      // A malformed %-sequence: look the anchor up as written.
    }

    container
      .querySelector(`[id="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      this.scrollToAnchor(container, href.slice(1));

      return;
    }

    let url: URL;

    try {
      // Resolve against the help center, not the dashboard's own origin.
      url = new URL(href, this.args.article.url);
    } catch {
      return;
    }

    if (['http:', 'https:', 'mailto:'].includes(url.protocol)) {
      this.window.open(url.href, '_blank', 'noopener,noreferrer');
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase::Panel::Article': typeof TopNavKnowledgeBasePanelArticleComponent;
  }
}
