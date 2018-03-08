import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('namespace-component', 'Integration | Component | namespace component', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    component.send('toggleNamespaceModal');
    assert.equal(component.get('showNamespaceModal'),true, "Toggle Modal");
  });
});
