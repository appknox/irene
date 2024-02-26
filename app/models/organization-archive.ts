import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { inject as service } from '@ember/service';
import LoggerService from 'irene/services/logger';
import type OrganizationUserModel from './organization-user';
import IntlService from 'ember-intl/services/intl';

export enum OrganizationArchiveModelGeneratedVia {
  DASHBOARD = 0,
  CRM = 1,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  PARTNER = 1,
}

export default class OrganizationArchiveModel extends Model {
  @service declare logger: LoggerService;
  @service declare intl: IntlService;

  GeneratedViaEnum = OrganizationArchiveModelGeneratedVia;

  get EXPIRED() {
    return this.intl.t('expired');
  }

  get INPROGRESS() {
    return this.intl.t('inProgress');
  }

  get AVAILABLE() {
    return this.intl.t('available');
  }

  get ERRORED() {
    return this.intl.t('errored');
  }

  get SYSTEM() {
    return this.intl.t('system');
  }

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare availableUntil: Date;

  @belongsTo('organization-user', { inverse: null })
  declare generatedBy: AsyncBelongsTo<OrganizationUserModel>;

  @attr('date')
  declare fromDate: Date;

  @attr('date')
  declare toDate: Date;

  @attr('number')
  declare progressPercent: number;

  @attr('number')
  declare generatedVia: OrganizationArchiveModelGeneratedVia;

  async downloadURL() {
    const adapter = this.store.adapterFor('organization-archive');

    try {
      const response = await adapter.getDownloadURL(this.id);

      if (response && response.url && response.url.length) {
        return response.url;
      }
    } catch (err) {
      this.logger.error(
        'Download organization archive URL network call failed',
        err
      );
    }

    return '';
  }

  get isCRM() {
    return this.generatedVia == this.GeneratedViaEnum.CRM;
  }

  get generatedByDisplay() {
    if (this.isCRM) {
      return this.SYSTEM;
    }
    return this.generatedBy.get('username');
  }

  get status() {
    const expiryDate = this.availableUntil;
    const progressPercent = this.progressPercent;
    const currentDateTime = new Date();

    // check expiry first before progress to notify of expiry as priority
    if (currentDateTime > expiryDate) {
      return this.EXPIRED;
    }

    if (progressPercent < 100) {
      return this.INPROGRESS;
    }

    if (progressPercent === 100) {
      return this.AVAILABLE;
    }

    return this.ERRORED;
  }

  get isAvailable() {
    return this.status == this.AVAILABLE;
  }

  get isInProgress() {
    return this.status == this.INPROGRESS;
  }

  get isExpired() {
    return this.status == this.EXPIRED;
  }

  get isErrrored() {
    return this.status == this.ERRORED;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-archive': OrganizationArchiveModel;
  }
}
