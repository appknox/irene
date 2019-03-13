import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('project-settings', 'Integration | Component | project settings', {
  unit: true
});

test('it exists', function(assert) {
  const component = this.subject();
  run(function() {
    component.set("isGeneralSettings", true);
    component.set("isAnalysisSettings", true);
    assert.equal(component.get("generalSettingsClass"), "is-active", 'General Settings Class');
    assert.equal(component.get("analysisSettingsClass"), "is-active", 'Analysis Settings Class');
    component.send("displayGeneralSettings");
    component.send("displaAnalysisSettings");
  });
});
