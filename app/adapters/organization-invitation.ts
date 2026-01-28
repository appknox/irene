import Store from 'ember-data/store';
import commondrf from './commondrf';
import OrganizationInvitationModel from 'irene/models/organization-invitation';

export default class OrganizationInvitationAdapter extends commondrf {
  _buildURL(modelName?: string | number, id?: string | number) {
    const baseURL = `${this.namespace}/organizations/${this.organization?.selected?.id}/invitations`;

    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseURL);
  }

  resend(
    store: Store,
    modelName: string,
    snapshot: OrganizationInvitationModel
  ) {
    const id = snapshot.id;
    const url = this.urlForResend(modelName, id);

    return this.ajax(url, 'POST', {
      data: {},
    });
  }

  urlForResend(modelName?: string | number, id?: string | number) {
    const baseURL = this._buildURL(modelName, id);

    return [baseURL, 'resend'].join('/');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-invitation': OrganizationInvitationAdapter;
  }
}
