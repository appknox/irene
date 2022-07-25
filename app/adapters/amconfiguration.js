import commondrf from './commondrf';

export default class AMConfigurationAdapter extends commondrf {
  buildURL(modelName, id) {
    if (!id) {
      throw Error('Id not provided');
    }

    return this.buildURLFromBase(
      `/${this.namespace_v2}/am_configuration/${encodeURIComponent(id)}`
    );
  }

  from_organization(organization_id) {
    const url = this.buildOrganizationAmConfigurationURL(organization_id);

    return this.ajax(url, 'GET');
  }

  buildOrganizationAmConfigurationURL(organization_id) {
    const orgAdapter = this.store.adapterFor('organization');

    return (
      orgAdapter.buildURL('organization', organization_id) + '/am_configuration'
    );
  }
}
