import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type FileModel from 'irene/models/file';

interface DynamicScanSignature {
  Args: {
    file: FileModel;
    profileId: number;
  };
  Blocks: {
    default: [];
  };
}

export default class DynamicScan extends Component<DynamicScanSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked dynamicScan: DynamicscanModel | null = null;

  fetchDynamicscan = task(async () => {
    const id = this.args.profileId;

    try {
      this.dynamicScan = await this.store.findRecord('dynamicscan', id);
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan': typeof DynamicScan;
  }
}
