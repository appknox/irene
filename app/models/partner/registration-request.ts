import Model, { attr } from '@ember-data/model';
import dayjs from 'dayjs';

export interface RegistrationRequestData {
  company: string;
  first_name: string;
  last_name: string;
}

export type PartnerRegistrationRequestModelName =
  'partner/registration-request';

export default class PartnerRegistrationRequestModel extends Model {
  private modelName =
    PartnerRegistrationRequestModel.modelName as PartnerRegistrationRequestModelName;

  @attr('string')
  declare email: string;

  @attr()
  declare data: RegistrationRequestData;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @attr('date')
  declare validUntil: Date;

  @attr('string')
  declare approvalStatus: string;

  @attr('string')
  declare source: string;

  @attr('boolean')
  declare isActivated: boolean;

  get fullName(): string {
    return `${this.data.first_name ? this.data.first_name : ''}${
      this.data.last_name ? ' ' + this.data.last_name : ''
    }`;
  }

  get hasExpired(): boolean {
    return dayjs(this.validUntil).isBefore(dayjs());
  }

  updateStatus(status: string) {
    const data = {
      approval_status: status,
    };

    const adapter = this.store.adapterFor(this.modelName);

    return adapter.patch(this.id, this.modelName, data);
  }

  resend() {
    const adapter = this.store.adapterFor(this.modelName);

    return adapter.resend(this.id, this.modelName);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/registration-request': PartnerRegistrationRequestModel;
  }
}
