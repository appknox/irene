import Model, { attr } from '@ember-data/model';
import dayjs from 'dayjs';

export default class OrganizationSigningCertificateModel extends Model {
  @attr('string')
  declare name: string | null;

  @attr('string')
  declare bundleId: string | null;

  @attr('string')
  declare appId: string | null;

  @attr('string')
  declare teamId: string | null;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare isExpired: boolean;

  @attr('boolean')
  declare provisionsAllDevices: boolean;

  @attr()
  declare provisionedUdids: string[];

  @attr('string')
  declare expiresAt: string | null;

  get expiresOn() {
    return this.expiresAt
      ? dayjs(this.expiresAt).format('MMMM D, YYYY, hh:mm A')
      : '';
  }

  get statusColor() {
    return this.isExpired ? 'error' : 'success';
  }

  async activate() {
    const adapter = this.store.adapterFor('organization-signing-certificate');

    return await adapter.activate(this);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-signing-certificate': OrganizationSigningCertificateModel;
  }
}
