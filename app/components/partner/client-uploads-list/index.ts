import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

import PartnerService from 'irene/services/partner';
import parseError from 'irene/utils/parse-error';
import PartnerclientProjectFileModel from 'irene/models/partner/partnerclient-project-file';

interface PartnerClientUploadsListSignature {
  Args: {
    clientId: string;
    projectId: string;
  };
}

type PartnerClientUploadsResponseModel =
  DS.AdapterPopulatedRecordArray<PartnerclientProjectFileModel> & {
    meta?: { count: number };
  };

export default class PartnerClientUploadsListComponent extends Component<PartnerClientUploadsListSignature> {
  @service declare partner: PartnerService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked
  partnerClientUploadsReponse: PartnerClientUploadsResponseModel | null = null;

  @tracked hasErrored = false;
  @tracked limit = 10;
  @tracked offset = 0;

  constructor(owner: unknown, args: PartnerClientUploadsListSignature['Args']) {
    super(owner, args);

    this.fetchPartnerClientUploads.perform(this.limit, this.offset);
  }

  get partnerClientUploadList() {
    return this.partnerClientUploadsReponse?.slice() || [];
  }

  get totalParnterClientUploadsCount() {
    return this.partnerClientUploadsReponse?.meta?.count || 0;
  }

  get hasNoParnterClientUpload() {
    return this.totalParnterClientUploadsCount === 0;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchPartnerClientUploads.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchPartnerClientUploads.perform(limit, 0);
  }

  fetchPartnerClientUploads = task(async (limit, offset) => {
    try {
      this.hasErrored = false;

      this.partnerClientUploadsReponse = await this.store.query(
        'partner/partnerclient-project-file',
        {
          limit,
          offset,
          clientId: this.args.clientId,
          projectId: this.args.projectId,
        }
      );
    } catch (e) {
      this.hasErrored = true;

      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientUploadsList': typeof PartnerClientUploadsListComponent;
  }
}
