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

  async from_organization(organization_id) {
    const url = `/api/organization/${organization_id}/am_configuration`;

    return this.ajax(url);
  }
}
