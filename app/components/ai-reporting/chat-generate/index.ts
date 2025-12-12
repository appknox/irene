import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import { ReportRequestStatus } from 'irene/models/ai-reporting/report-request';
import parseError from 'irene/utils/parse-error';
import type ReportRequestModel from 'irene/models/ai-reporting/report-request';
import type PollService from 'irene/services/poll';
import type OrganizationAiFeatureModel from 'irene/models/organization-ai-feature';

export default class AiReportingChatGenerate extends Component {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare poll: PollService;
  @service('notifications') declare notify: NotificationService;

  @tracked reportQuery = '';
  @tracked isGenerating = false;
  @tracked selectedCategory = this.categories[0];

  @tracked reportRequest: ReportRequestModel | null = null;
  @tracked aiFeatures: OrganizationAiFeatureModel | null = null;

  stopPolling: (() => void) | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchOrganizationAiFeatures.perform();
  }

  // Categories of report prompts available to users
  get categories() {
    return [
      { id: 'scan', label: this.intl.t('reportModule.categories.scan.label') },
      {
        id: 'users',
        label: this.intl.t('reportModule.categories.users.label'),
      },
    ];
  }

  get showTurnOnSettings() {
    return (
      !this.aiFeatures?.reporting && !this.fetchOrganizationAiFeatures.isRunning
    );
  }

  // All prompt examples by category
  get promptsByCategory() {
    return {
      scan: [
        this.intl.t('reportModule.categories.scan.prompt1'),
        this.intl.t('reportModule.categories.scan.prompt2'),
        this.intl.t('reportModule.categories.scan.prompt3'),
        this.intl.t('reportModule.categories.scan.prompt4'),
        this.intl.t('reportModule.categories.scan.prompt5'),
      ],
      users: [
        this.intl.t('reportModule.categories.users.prompt1'),
        this.intl.t('reportModule.categories.users.prompt2'),
        this.intl.t('reportModule.categories.users.prompt3'),
        this.intl.t('reportModule.categories.users.prompt4'),
        this.intl.t('reportModule.categories.users.prompt5'),
      ],
    };
  }

  // Filtered prompts based on selected category
  get filteredPrompts() {
    return (
      this.promptsByCategory[
        this.selectedCategory?.id as keyof typeof this.promptsByCategory
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
  handleUserPromptInput(event: Event) {
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
      if (
        this.reportRequest?.status === ReportRequestStatus.COMPLETED ||
        this.reportRequest?.status === ReportRequestStatus.FAILED
      ) {
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

    try {
      this.reportRequest = this.store.createRecord(
        'ai-reporting/report-request',
        { query: this.reportQuery }
      );

      await this.reportRequest.save();

      this.isGenerating = true;

      this.pollReportGenerationStatus();
    } catch (err) {
      const error = err as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (error?.errors?.[0]?.detail) {
        const payload = JSON.parse(error.errors[0].detail);
        errMsg = payload?.message ?? errMsg;
      }

      this.notify.error(errMsg);
    }
  });

  fetchOrganizationAiFeatures = task(async () => {
    try {
      this.aiFeatures = await this.store.queryRecord(
        'organization-ai-feature',
        {}
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  willDestroy(): void {
    super.willDestroy();
    this.stopPolling?.();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::ChatGenerate': typeof AiReportingChatGenerate;
  }
}
