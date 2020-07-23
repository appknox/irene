import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | project settings', function(hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const component = this.owner.factoryFor('component:project-settings').create();
    run(function () {
      component.set("isGeneralSettings", true);
      component.set("isAnalysisSettings", true);
      assert.equal(component.get("generalSettingsClass"), "is-active", 'General Settings Class');
      assert.equal(component.get("analysisSettingsClass"), "is-active", 'Analysis Settings Class');
      component.send("displayGeneralSettings");
      component.send("displaAnalysisSettings");
    });
  });
});
