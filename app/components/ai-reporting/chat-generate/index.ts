import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type ReportRequestModel from 'irene/models/report-request';
import { ReportRequestStatus } from 'irene/models/report-request';
import type PollService from 'irene/services/poll';

interface AiReportingChatGenerateSignature {}

export default class AiReportingChatGenerate extends Component<AiReportingChatGenerateSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare poll: PollService;
  @service('notifications') declare notify: NotificationService;

  @tracked reportQuery = '';
  @tracked isGenerating = false;

  @tracked selectedCategory: { id: string; label: string } = {
    id: 'scan',
    label: 'Scan',
  };

  @tracked reportRequest: ReportRequestModel | null = null;

  stopPolling: (() => void) | null = null;

  // Categories of report prompts available to users
  categories = [{ id: 'scan', label: 'Scan' }];

  // All prompt examples by category
  promptsByCategory = {
    scan: [
      'Get all the projects',
      'List all the open issues',
      'I need a OWASP Mobile Top 10 2024 report for all my apps',
    ],
  };

  willDestroy(): void {
    super.willDestroy();
    this.stopPolling?.();
  }

  // Filtered prompts based on selected category
  get filteredPrompts() {
    return (
      this.promptsByCategory[
        this.selectedCategory.id as keyof typeof this.promptsByCategory
      ] || []
    );
  }

  get disableGenerateButton() {
    return !this.reportQuery.trim() || this.reportQuery.length > 400;
  }

  @action
  updateSelectedCategory(selectedCategory: { id: string; label: string }) {
    this.selectedCategory = selectedCategory;
  }

  @action
  updateReportDescription(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.reportQuery = target.value;
  }

  @action
  usePrompt(prompt: string) {
    this.reportQuery = prompt;
  }

  @action
  pollReportGenerationStatus() {
    this.stopPolling = this.poll.startPolling(async () => {
      if (this.reportRequest?.status === ReportRequestStatus.COMPLETED) {
        this.stopPolling?.();

        this.isGenerating = false;

        this.router.transitionTo(
          'authenticated.reports.preview',
          this.reportRequest?.id
        );
      }

      await this.reportRequest?.reload();
    }, 3000);
  }

  generateReport = task(async () => {
    if (!this.reportQuery.trim()) {
      this.notify.error(this.intl.t('reportModule.pleaseEnterDescription'));

      return;
    }

    this.reportRequest = this.store.createRecord('report-request', {
      query: this.reportQuery,
    });

    await this.reportRequest.save();

    this.isGenerating = true;

    this.pollReportGenerationStatus();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::ChatGenerate': typeof AiReportingChatGenerate;
  }
}
