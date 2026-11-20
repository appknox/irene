import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type LoggerService from 'irene/services/logger';

import styles from './index.scss';

export interface KnowledgeBaseArticleSummary {
  id: string;
  title: string;
  description: string;
  url: string;
  category_id: string | null;
  snippet?: string;
}

export interface KnowledgeBaseArticle extends KnowledgeBaseArticleSummary {
  body: string;
}

interface KnowledgeBaseIndexResponse {
  suggested?: KnowledgeBaseArticleSummary[];
}

interface KnowledgeBaseSearchResponse {
  results?: KnowledgeBaseArticleSummary[];
}

export interface TopNavKnowledgeBasePanelSignature {
  Element: HTMLElement;
  Args: { onClose: () => void };
}

const SEARCH_DEBOUNCE_MS = 300;

export default class TopNavKnowledgeBasePanelComponent extends Component<TopNavKnowledgeBasePanelSignature> {
  @service declare ajax: IreneAjaxService;
  @service declare logger: LoggerService;

  @tracked searchQuery = '';
  @tracked suggested: KnowledgeBaseArticleSummary[] = [];
  @tracked searchResults: KnowledgeBaseArticleSummary[] = [];
  @tracked selectedArticleId: string | null = null;
  @tracked article: KnowledgeBaseArticle | null = null;
  @tracked hasListError = false;
  @tracked hasArticleError = false;

  constructor(owner: unknown, args: TopNavKnowledgeBasePanelSignature['Args']) {
    super(owner, args);

    this.fetchSuggested.perform();
  }

  get drawerContainerClass() {
    return styles['drawer-container'];
  }

  get showBackButton() {
    return this.selectedArticleId !== null;
  }

  get isSearching() {
    return this.searchQuery.trim().length > 0;
  }

  get articles() {
    return this.isSearching ? this.searchResults : this.suggested;
  }

  get isLoading() {
    return this.fetchSuggested.isRunning || this.searchArticles.isRunning;
  }

  get showNoArticles() {
    return this.isSearching && !this.isLoading && this.articles.length === 0;
  }

  endpoint(path = '') {
    return `${ENV.endpoints['hubspotKnowledgeBase']}/${path}`;
  }

  @action
  handleSearchInput(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.searchArticles.perform(this.searchQuery);
  }

  @action
  handleOpenArticle(summary: KnowledgeBaseArticleSummary) {
    this.selectedArticleId = summary.id;
    this.article = null;
    this.fetchArticle.perform(summary.id);
  }

  @action
  handleBack() {
    this.fetchArticle.cancelAll();
    this.selectedArticleId = null;
    this.article = null;
    this.hasArticleError = false;
  }

  // The ajax service resolves (not rejects) a 429, so the payload is checked.
  fetchSuggested = task(async () => {
    try {
      const data = await this.ajax.request<KnowledgeBaseIndexResponse>(
        this.endpoint(),
        { namespace: ENV.namespace_v2 }
      );

      if (!Array.isArray(data?.suggested)) {
        throw new Error('Unexpected knowledge base response');
      }

      this.suggested = data.suggested;
      this.hasListError = false;
    } catch (error) {
      this.logger.debug('Knowledge base articles unavailable', error);
      this.hasListError = true;
    }
  });

  searchArticles = task({ restartable: true }, async (query: string) => {
    if (!query.trim()) {
      this.searchResults = [];
      this.hasListError = false;

      return;
    }

    await timeout(SEARCH_DEBOUNCE_MS);

    try {
      const data = await this.ajax.request<KnowledgeBaseSearchResponse>(
        this.endpoint(`search/?q=${encodeURIComponent(query.trim())}`),
        { namespace: ENV.namespace_v2 }
      );

      if (!Array.isArray(data?.results)) {
        throw new Error('Unexpected knowledge base response');
      }

      this.searchResults = data.results;
      this.hasListError = false;
    } catch (error) {
      this.logger.debug('Knowledge base search unavailable', error);
      this.searchResults = [];
      this.hasListError = true;
    }
  });

  fetchArticle = task({ restartable: true }, async (id: string) => {
    try {
      const article = await this.ajax.request<KnowledgeBaseArticle>(
        this.endpoint(`${encodeURIComponent(id)}/`),
        { namespace: ENV.namespace_v2 }
      );

      if (typeof article?.body !== 'string') {
        throw new Error('Unexpected knowledge base response');
      }

      this.article = article;
      this.hasArticleError = false;
    } catch (error) {
      this.logger.debug('Knowledge base article unavailable', error);
      this.hasArticleError = true;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase::Panel': typeof TopNavKnowledgeBasePanelComponent;
  }
}
