import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

const RecentIssuesComponent = Component.extend({
  analytics: service('analytics'),

  didInsertElement() {
    this.recentIssuesData();
  },

  recentIssuesData() {
    return this.get("recentIssues");
  },

  recentIssues: computed(function() {
    return this.get("analytics.recentIssues").results;
  })

});

export default RecentIssuesComponent;
