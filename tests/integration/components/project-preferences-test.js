import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('project-preferences', 'Integration | Component | project preferences', {
  unit: true,
  needs: [
    'model:device'
  ]
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  Ember.run(function() {
    assert.deepEqual(component.get('availableDevices'),[], "Available Devices");

    assert.deepEqual(component.get('filteredDevices'),[], "Filtered Devices");

    component.send("openProjectPreferenceModal");
    assert.equal(component.get('projectPreferenceModal'),true, "Open Modal");
    component.send("closeProjectPreferenceModal");
    assert.equal(component.get('projectPreferenceModal'),false, "Close Modal");
  });
});
