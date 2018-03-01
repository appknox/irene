import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('settings-split', 'Integration | Component | settings split', {
  unit: true
});

test('it renders', function(assert) {
  assert.ok(true);
});

test('tapping button fires an external action', function(assert) {
  assert.expect(3);

  var component = this.subject();

  Ember.run(function() {
    assert.equal(component.get('generalClass'),"is-active", "General");
    component.set("isSecurity", true);
    assert.equal(component.get('securityClass'),"is-active", "Security");
    component.set("isDeveloperSettings", true);
    assert.equal(component.get('developerSettingsClass'),"is-active", "Developer Settings");
  });
});
