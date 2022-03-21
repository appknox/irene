/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { computed } from '@ember/object';

const RecentIssuesComponent = Component.extend({

  recentIssues: computed('store', function() {
    return this.get('store').findAll('analytics/recent-issue');
  })

});

export default RecentIssuesComponent;
