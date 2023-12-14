import Component from '@glimmer/component';
import { findAll } from 'ember-data-resources';

import AnalyticsRecentIssueModel from 'irene/models/analytics/recent-issue';

export default class OrganizationAnalyticsRecentIssuesComponent extends Component {
  recentIssues = findAll<AnalyticsRecentIssueModel>(
    this,
    'analytics/recent-issue'
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationAnalytics::RecentIssues': typeof OrganizationAnalyticsRecentIssuesComponent;
  }
}
