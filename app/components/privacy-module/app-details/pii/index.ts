import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type PrivacyModuleService from 'irene/services/privacy-module';
import type PiiModel from 'irene/models/pii';
import type MeService from 'irene/services/me';

export interface PrivacyModuleAppDetailsPiiSignature {
  Args: {
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
  @tracked piiEnabled: boolean = false;

  constructor(
    owner: unknown,
    args: PrivacyModuleAppDetailsPiiSignature['Args']
  ) {
    super(owner, args);

    this.privacyModule.fetchPiiData.perform(this.fileId, true);

    this.fetchOrganizationAiFeatures.perform();
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

  @action openPiiDetailsDrawer({ rowValue }: { rowValue: PiiModel }) {
    this.selectedPii = rowValue;

    if (this.selectedPii?.highlight) {
      this.markCategorySeen.perform();
    }
  }

  @action closePiiDetailsDrawer() {
    this.selectedPii = null;
  }

  get piiIsSelected() {
    return !!this.selectedPii;
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

  markCategorySeen = task(async () => {
    try {
      if (this.selectedPii && this.privacyModule.selectedPiiId) {
        await this.selectedPii.markPiiTypeSeen(
          this.privacyModule.selectedPiiId,
          this.selectedPii.type
        );

        this.selectedPii.highlight = false;
      }
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Pii': typeof PrivacyModuleAppDetailsPiiComponent;
  }
}
