import { getOwner } from '@ember/application';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';
import ENUMS from 'irene/enums';

moduleForComponent('risk-tag', 'Integration | Component | risk tag', {
  unit: true,
  needs: [
    'service:i18n',
    'locale:en/translations',
    'locale:en/config',
    'util:i18n/missing-message',
    'util:i18n/compile-template',
    'config:environment'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);

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
