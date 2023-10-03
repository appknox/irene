/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class OrganizationJiraProject extends commondrf {
  _buildURL(modelName: string | number, id: string | number) {
    const baseurl = `${this.get('namespace')}/organizations/${
      this.organization?.selected?.id
    }/jira_projects`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'organization-jiraproject': OrganizationJiraProject;
  }
}
