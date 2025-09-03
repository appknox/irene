import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type { PrivacyModulePiiQueryParam } from 'irene/routes/authenticated/dashboard/privacy-module/app-details/pii';
import type FileModel from 'irene/models/file';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type PiiModel from 'irene/models/pii';
import type MeService from 'irene/services/me';

export interface PrivacyModuleAppDetailsPiiSignature {
  Args: {
    queryParams: PrivacyModulePiiQueryParam;
    file: FileModel;
  };
}

export default class PrivacyModuleAppDetailsPiiComponent extends Component<PrivacyModuleAppDetailsPiiSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare privacyModule: PrivacyModuleService;
  @service declare me: MeService;
  @service declare intl: IntlService;

  @tracked selectedPii: PiiModel | null = null;
  @tracked aiDrawerOpen = false;
  @tracked piiEnabled: boolean = false;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsPiiSignature['Args']
  ) {
    super(owner, args);

    this.privacyModule.fetchPiiData.perform(
      this.limit,
      this.offset,
      this.fileId,
      false
    );

    this.fetchOrganizationAiFeatures.perform();
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get fileId() {
    return this.args.file.id;
  }

  get columns() {
    return [
      {
        name: this.intl.t('privacyModule.piiCategory'),
        component: 'privacy-module/app-details/pii/table/category',
        width: 70,
        isResizable: false,
        isReorderable: false,
      },
      {
        name: this.intl.t('privacyModule.piiDataFound'),
        component: 'privacy-module/app-details/pii/table/data-found',
        width: 180,
        isResizable: false,
        isReorderable: false,
      },
    ];
  }

  get piiDataList() {
    return this.privacyModule.piiDataList;
  }

  get piiDataCount() {
    return this.privacyModule.piiDataCount;
  }

  get justifyContentValue() {
    return this.piiDataAvailable ? 'space-between' : 'right';
  }

  get isOwner() {
    return this.me.org?.get('is_owner');
  }

  get resultDependencies() {
    return [this.limit, this.offset];
  }

  @action handlePrevNextAction(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.privacyModule.fetchPiiData.perform(limit, offset, this.fileId);
  }

  @action handleItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;
    const offset = 0;

    this.privacyModule.fetchPiiData.perform(limit, offset, this.fileId);
  }

  @action handleResultDependenciesChange() {
    this.privacyModule.fetchPiiData.perform(
      this.limit,
      this.offset,
      this.fileId,
      false
    );
  }

  @action openPiiDetailsDrawer({ rowValue }: any) {
    this.selectedPii = rowValue;
  }

  @action closePiiDetailsDrawer() {
    this.selectedPii = null;
  }

  @action openAIDrawer() {
    this.aiDrawerOpen = true;
  }

  @action closeAiDrawer() {
    this.aiDrawerOpen = false;
  }

  get piiIsSelected() {
    return !!this.selectedPii;
  }

  get selectedPiiData() {
    return this.selectedPii?.piiData?.[0];
  }

  get multiplePiiDataLength() {
    return this.selectedPii?.piiData?.length ?? 0;
  }

  get multiplePiiData() {
    return this.multiplePiiDataLength > 1;
  }

  get piiDataAvailable() {
    return this.privacyModule.piiDataAvailable;
  }

  get isFetching() {
    return (
      this.privacyModule.fetchPiiData.isRunning ||
      this.fetchOrganizationAiFeatures.isRunning
    );
  }

  get hasNoPii() {
    return this.piiDataCount === 0;
  }

  get showEmptyContent() {
    return !this.isFetching && this.hasNoPii && this.piiDataAvailable;
  }

  get drawerInfo() {
    return [
      {
        title: this.intl.t('privacyModule.piiAiDrawer.aiDataQ1'),
        body: this.intl.t('privacyModule.piiAiDrawer.aiDataQ1Desc'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('privacyModule.piiAiDrawer.aiDataQ2'),
        body: this.intl.t('privacyModule.piiAiDrawer.aiDataQ2Desc'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('privacyModule.piiAiDrawer.aiDataQ3'),
        body: this.intl.t('privacyModule.piiAiDrawer.aiDataQ3Desc', {
          htmlSafe: true,
        }),
        marginTop: 'mt-2',
      },
    ];
  }

  @action
  getSource(source?: string) {
    if (source === 'BINARY') {
      return this.intl.t('appBinary');
    }

    return this.intl.t('api');
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('urlCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.intl.t('somethingWentWrong'));
  }

  fetchOrganizationAiFeatures = task(async () => {
    try {
      const aiFeatures = await this.store.queryRecord(
        'organization-ai-feature',
        {}
      );

      this.piiEnabled = aiFeatures.pii;
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Pii': typeof PrivacyModuleAppDetailsPiiComponent;
  }
}
