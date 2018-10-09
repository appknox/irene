import Component from '@ember/component';
import { computed } from '@ember/object';

const OverallReportComponent = Component.extend({

  analytics: computed(function() {
    return this.get('store').queryRecord('analytics/scancount', {});
  })
});

export default OverallReportComponent;
