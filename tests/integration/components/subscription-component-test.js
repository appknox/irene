import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('subscription-component', 'Integration | Component | subscription component', {
  unit: true
});


test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('openCancelSubscriptionConfirmBox');
    assert.equal(component.get('showCancelSubscriptionConfirmBox'),true, "Open Modal");
    component.send('closeCancelSubscriptionConfirmBox');
    assert.equal(component.get('showCancelSubscriptionConfirmBox'),false, "Close Modal");
  });
});
