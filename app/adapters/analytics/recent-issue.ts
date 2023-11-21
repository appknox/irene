import commondrf from '../commondrf';

export default class RecentIssueAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(
      `${this.namespace}/organizations/${this.organization.selected?.id}/recent_issues`
    );
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'analytics/recent-issue': RecentIssueAdapter;
  }
}
