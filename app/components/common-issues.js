/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';

const CommonIssuesComponent = Ember.Component.extend({

  stat: (function() {
    return this.get('store').find('stat', 1);
  }).property()
});

export default CommonIssuesComponent;
