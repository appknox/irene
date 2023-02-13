import commondrf from './commondrf';

export default class AMConfigurationAdapter extends commondrf {
  buildURL(_modelName?: string | number, id?: string | number) {
    if (!id) {
      throw Error('Id not provided');
    }

    return this.buildURLFromBase(
      `/${this.namespace_v2}/am_configurations/${encodeURIComponent(id)}`
    );
  }

  from_organization(organization_id: string) {
    const url = this.buildOrganizationAmConfigurationURL(organization_id);

    return this.ajax(url, 'GET');
  }

  buildOrganizationAmConfigurationURL(organization_id: string) {
    const orgAdapter = this.store.adapterFor('organization');

    return (
      orgAdapter.buildURL('organization', organization_id) + '/am_configuration'
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    amconfiguration: AMConfigurationAdapter;
  }
}
