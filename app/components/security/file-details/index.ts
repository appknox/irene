import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import parseError from 'irene/utils/parse-error';

import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';
import type SecurityFileModel from 'irene/models/security/file';
import type SecurityManualScanDetailModel from 'irene/models/security/manual-scan-detail';

export interface SecurityFileDetailsComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

export default class SecurityFileDetailsComponent extends Component<SecurityFileDetailsComponentSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked manualScanDetail: SecurityManualScanDetailModel | null = null;

  constructor(
    owner: unknown,
    args: SecurityFileDetailsComponentSignature['Args']
  ) {
    super(owner, args);

    this.loadManualScanDetail.perform();
  }

  // Via the relationship proxy: a file opened from the list has no project
  // until it reloads.
  get isManualScanAvailable() {
    return this.args.file.project.get('isManualScanAvailable');
  }

  loadManualScanDetail = task(async () => {
    try {
      // reload: the form copies the record once, on render.
      this.manualScanDetail = await this.store.findRecord(
        'security/manual-scan-detail',
        this.args.file.id as string,
        { reload: true }
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileDetails': typeof SecurityFileDetailsComponent;
  }
}
