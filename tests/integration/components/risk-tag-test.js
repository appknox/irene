import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import ENUMS from 'irene/enums';
import tHelper from 'ember-intl/helpers/t';

module('Integration | Component | risk tag', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');

    this.owner.register('helper:t', tHelper);

    // register t helper
    this.owner.register('helper:t', tHelper);
  });

  test('analysisRiskStatus is computed correctly', function(assert) {
    var component = this.owner.factoryFor('component:risk-tag').create();
    run(function() {
      component.set('analysis', {computedRisk: 3, status: ENUMS.ANALYSIS.COMPLETED});
      const analysisRiskStatus1 = component.get('analysisRiskStatus');
      assert.equal(analysisRiskStatus1.cssclass, 'is-danger');
      assert.equal(analysisRiskStatus1.icon, 'fa-warning');
      assert.equal(analysisRiskStatus1.label, 'High');

      component.set('analysis', {computedRisk: -1, status: ENUMS.ANALYSIS.WAITING});
      const analysisRiskStatus2 = component.get('analysisRiskStatus');
      assert.equal(analysisRiskStatus2.cssclass, 'is-waiting');
      assert.equal(analysisRiskStatus2.icon, 'fa-minus-circle');
      assert.equal(analysisRiskStatus2.label, 'Not started');
    });
  });
});
