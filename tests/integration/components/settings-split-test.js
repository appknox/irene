import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('settings-split', 'Integration | Component | settings split', {
  unit: true
});

test('it renders', function(assert) {
  assert.ok(true);
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  run(function() {
    assert.equal(component.get('generalClass'),"is-active", "General");
    component.set("isSecurity", true);
    assert.equal(component.get('securityClass'),"is-active", "Security");
    component.set("isDeveloperSettings", true);
    assert.equal(component.get('developerSettingsClass'),"is-active", "Developer Settings");
    component.send("displayGeneral");
    assert.equal(component.get('isGeneral'),true, "General");
    assert.equal(component.get('isSecurity'),false, "Security");
    assert.equal(component.get('isDeveloperSettings'),false, "Developer Settings");
    component.send("displaySecurity");
    assert.equal(component.get('isGeneral'),false, "General");
    assert.equal(component.get('isSecurity'),true, "Security");
    assert.equal(component.get('isDeveloperSettings'),false, "Developer Settings");
    component.send("displayDeveloperSettings");
    assert.equal(component.get('isGeneral'),false, "General");
    assert.equal(component.get('isSecurity'),false, "Security");
    assert.equal(component.get('isDeveloperSettings'),true, "Developer Settings");

    assert.notOk(component.didInsertElement());

  });
});
