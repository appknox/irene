import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';
import ENUMS from 'irene/enums';
import tHelper from 'ember-intl/helpers/t';

moduleForComponent('risk-tag', 'Integration | Component | risk tag', {
  unit: true,
  needs: [
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'translation:en',
    'util:intl/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');

    this.registry.register('helper:t', tHelper);

    // register t helper
    this.register('helper:t', tHelper);
  }
});

test('analysisRiskStatus is computed correctly', function(assert) {
  var component = this.subject();
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
