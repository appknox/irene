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
import PartnerPartnerclientProjectModel from 'irene/models/partner/partnerclient-project';

interface PartnerClientProjectListSignature {
  Args: {
    clientId: string;
  };
}

type PartnerClientProjectsResponseModel =
  DS.AdapterPopulatedRecordArray<PartnerPartnerclientProjectModel> & {
    meta?: { count: number };
  };

export default class PartnerClientProjectListComponent extends Component<PartnerClientProjectListSignature> {
  @service declare partner: PartnerService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;

  @tracked
  partnerClientProjectsReponse: PartnerClientProjectsResponseModel | null =
    null;

  @tracked hasErrored = false;
  @tracked limit = 10;
  @tracked offset = 0;

  constructor(owner: unknown, args: PartnerClientProjectListSignature['Args']) {
    super(owner, args);

    this.fetchPartnerClientProjects.perform(this.limit, this.offset);
  }

  get partnerClientProjectList() {
    return this.partnerClientProjectsReponse?.toArray() || [];
  }

  get totalParnterClientProjectsCount() {
    return this.partnerClientProjectsReponse?.meta?.count || 0;
  }

  get hasNoParnterClientProject() {
    return this.totalParnterClientProjectsCount === 0;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchPartnerClientProjects.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchPartnerClientProjects.perform(limit, 0);
  }

  fetchPartnerClientProjects = task(async (limit, offset) => {
    try {
      this.hasErrored = false;

      this.partnerClientProjectsReponse = await this.store.query(
        'partner/partnerclient-project',
        {
          limit,
          offset,
          clientId: this.args.clientId,
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
    'Partner::ClientProjectList': typeof PartnerClientProjectListComponent;
  }
}
