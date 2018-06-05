import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('project-settings', 'Integration | Component | project settings', {
  unit: true
});

test('it exists', function(assert) {
  const component = this.subject();
  Ember.run(function() {
    component.set("isGeneralSettings", true);
    component.set("isAnalysisSettings", true);
    assert.equal(component.get("generalSettingsClass"), "is-active", 'General Settings Class');
    assert.equal(component.get("analysisSettingsClass"), "is-active", 'Analysis Settings Class');
    component.send("displayGeneralSettings");
    component.send("displaAnalysisSettings");
  });
});
