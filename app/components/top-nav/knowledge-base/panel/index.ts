import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

import type IreneAjaxService from 'irene/services/ajax';

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
  suggested: KnowledgeBaseArticleSummary[];
}

interface KnowledgeBaseSearchResponse {
  results: KnowledgeBaseArticleSummary[];
}

export interface TopNavKnowledgeBasePanelSignature {
  Args: { onClose: () => void };
}

const SEARCH_DEBOUNCE_MS = 300;

export default class TopNavKnowledgeBasePanelComponent extends Component<TopNavKnowledgeBasePanelSignature> {
  @service declare ajax: IreneAjaxService;

  KB_ENDPOINT = '/api/v2/hubspot/kb/';

  @tracked searchQuery = '';
  @tracked suggested: KnowledgeBaseArticleSummary[] = [];
  @tracked searchResults: KnowledgeBaseArticleSummary[] = [];
  @tracked selectedArticleId: string | null = null;
  @tracked article: KnowledgeBaseArticle | null = null;
  @tracked hasError = false;

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

  @action
  handleSearchInput(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.searchArticles.perform(this.searchQuery);
  }

  @action
  openArticle(summary: KnowledgeBaseArticleSummary) {
    this.selectedArticleId = summary.id;
    this.article = null;
    this.fetchArticle.perform(summary.id);
  }

  @action
  goBack() {
    this.fetchArticle.cancelAll();
    this.selectedArticleId = null;
    this.article = null;
    this.hasError = false;
  }

  fetchSuggested = task(async () => {
    try {
      const data = await this.ajax.request<KnowledgeBaseIndexResponse>(
        this.KB_ENDPOINT
      );

      this.suggested = data.suggested;
      this.hasError = false;
    } catch {
      this.hasError = true;
    }
  });

  searchArticles = task({ restartable: true }, async (query: string) => {
    if (!query.trim()) {
      this.searchResults = [];

      return;
    }

    await timeout(SEARCH_DEBOUNCE_MS);

    try {
      const data = await this.ajax.request<KnowledgeBaseSearchResponse>(
        `${this.KB_ENDPOINT}search/?q=${encodeURIComponent(query.trim())}`
      );

      this.searchResults = data.results;
      this.hasError = false;
    } catch {
      this.hasError = true;
    }
  });

  fetchArticle = task({ restartable: true }, async (id: string) => {
    try {
      this.article = await this.ajax.request<KnowledgeBaseArticle>(
        `${this.KB_ENDPOINT}${encodeURIComponent(id)}/`
      );

      this.hasError = false;
    } catch {
      this.hasError = true;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'TopNav::KnowledgeBase::Panel': typeof TopNavKnowledgeBasePanelComponent;
  }
}
