import commondrf from './commondrf';

export default class ProjectAdapter extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseurl = `${this.namespace_v2}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization?.selected?.id}/projects`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    project: ProjectAdapter;
  }
}
