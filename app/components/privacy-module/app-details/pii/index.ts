import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';

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

  @tracked selectedPii: PiiModel | null = null;
  @tracked aiDrawerOpen = false;
  @tracked piiEnabled: boolean = false;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsPiiSignature['Args']
  ) {
    super(owner, args);

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
        name: 'PII Category',
        component: 'privacy-module/app-details/pii/table/category',
        width: 70,
      },
      {
        name: 'PII Data Found',
        component: 'privacy-module/app-details/pii/table/data-found',
        width: 180,
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
    return this.piiEnabled ? 'space-between' : 'right';
  }

  get isOwner() {
    return this.me.org?.get('is_owner');
  }

  @action goToPage(args: PaginationProviderActionsArgs) {
    console.log(args);
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
    return this.selectedPii?.piiData[0];
  }

  get multiplePiiDataLength() {
    return this.selectedPii?.piiData?.length ?? 0;
  }

  get multiplePiiData() {
    return this.multiplePiiDataLength > 1;
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
    return !this.isFetching && this.hasNoPii && this.piiEnabled;
  }

  get source() {
    return this.piiDataCount === 0;
  }

  get drawerInfo() {
    return [
      {
        title: 'What data does this AI model access in my app? ',
        body: 'Lorem ipsum dolor sit amet consectetur. Volutpat ullamcorper in placerat viverra ipsum imperdiet malesuada tellus. Fermentum quis varius eget faucibus vivamus. Commodo sagittis non duis sit tincidunt facilisi bibendum mi. Tortor aliquam egestas in non. Fermentum.',
        marginTop: 'mt-2',
      },
      {
        title:
          'Does any 3rd party product/service have access to this model which has been trained using my organizations applications?',
        body: 'Lorem ipsum dolor sit amet consectetur. Laoreet fermentum arcu at elementum amet maecenas est ultrices. Enim dapibus facilisi adipiscing commodo velit accumsan vitae.',
        marginTop: 'mt-2',
      },
      {
        title: 'How is this AI model secured from potential threats?',
        body: 'Lorem ipsum dolor sit amet consectetur. Volutpat ullamcorper in placerat viverra ipsum imperdiet malesuada tellus. Fermentum quis varius eget faucibus vivamus. Commodo sagittis non duis sit tincidunt facilisi bibendum mi. Tortor aliquam egestas in non. Fermentum faucibus elementum tristique donec elit vitae posuere etiam. Sem est commodo mattis elementum etiam vitae pellentesque aliquet.',
        marginTop: 'mt-2',
      },
    ];
  }

  @action
  getSource(source?: string) {
    if (source === 'BINARY') {
      return 'APP BINARY';
    }

    return 'API';
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info('URL Copied');

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error('Please Try Again');
  }

  fetchOrganizationAiFeatures = task(async () => {
    try {
      const aiFeatures = await this.store.queryRecord(
        'organization-ai-feature',
        {}
      );

      this.piiEnabled = aiFeatures.pii;

      if (this.piiEnabled) {
        this.privacyModule.fetchPiiData.perform(
          this.limit,
          this.offset,
          this.fileId,
          false
        );
      }
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
