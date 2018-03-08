import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('namespace-modal', 'Integration | Component | namespace modal', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    assert.equal(component.newNamespaceObserver(),true, "Namespace Observer");
  });
});
