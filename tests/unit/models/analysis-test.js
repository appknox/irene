/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal, qunit/no-assert-equal-boolean */
import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | analysis', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const analysis = store.createRecord('analysis');

    assert.equal(analysis.get('isScanning'), 0, 'Unknown');

    assert.equal(analysis.hasType(), false, 'No type');

    analysis.set(
      'vulnerability',
      store.createRecord('vulnerability', {
        types: [1, 2, 3],
      })
    );

    assert.equal(analysis.hasType(1), true, 'Has Type');

    analysis.set('risk', ENUMS.RISK.UNKNOWN);

    assert.equal(
      analysis.iconClass(ENUMS.RISK.UNKNOWN),
      'fa-spinner fa-spin',
      'Loading'
    );

    analysis.set('risk', ENUMS.RISK.NONE);

    assert.equal(analysis.iconClass(ENUMS.RISK.NONE), 'fa-check', 'Check');

    analysis.set('risk', ENUMS.RISK.CRITICAL);

    assert.equal(
      analysis.iconClass(ENUMS.RISK.CRITICAL),
      'fa-warning',
      'Warning'
    );

    assert.equal(
      analysis.get('riskIconClass'),
      'fa-warning',
      'Risk Icon Class'
    );

    const cls = 'tag';

    analysis.set('risk', ENUMS.RISK.UNKNOWN);

    assert.equal(
      analysis.labelClass(ENUMS.RISK.UNKNOWN),
      cls + ' ' + 'is-progress',
      'Progress'
    );

    analysis.set('risk', ENUMS.RISK.NONE);

    assert.equal(
      analysis.labelClass(ENUMS.RISK.NONE),
      cls + ' ' + 'is-success',
      'Success'
    );

    analysis.set('risk', ENUMS.RISK.LOW);

    assert.equal(
      analysis.labelClass(ENUMS.RISK.LOW),
      cls + ' ' + 'is-info',
      'Info'
    );

    analysis.set('risk', ENUMS.RISK.MEDIUM);

    assert.equal(
      analysis.labelClass(ENUMS.RISK.MEDIUM),
      cls + ' ' + 'is-warning',
      'Warning'
    );

    analysis.set('risk', ENUMS.RISK.HIGH);

    assert.equal(
      analysis.labelClass(ENUMS.RISK.HIGH),
      cls + ' ' + 'is-danger',
      'Danger'
    );

    analysis.set('risk', ENUMS.RISK.CRITICAL);

    assert.equal(
      analysis.labelClass(ENUMS.RISK.CRITICAL),
      cls + ' ' + 'is-critical',
      'Critical'
    );

    assert.equal(analysis.get('isRisky'), true, 'Is Risky');

    assert.equal(
      analysis.get('riskLabelClass'),
      'tag is-critical',
      'Risk Label Class'
    );

    analysis.set('overriddenRisk', ENUMS.RISK.CRITICAL);

    assert.equal(
      analysis.get('overriddenRiskIconClass'),
      'fa-warning',
      'Overridden Risk Icon Class'
    );

    assert.equal(
      analysis.get('overriddenRiskLabelClass'),
      cls + ' ' + 'is-critical',
      'Overridden Risk Icon Class'
    );
  });
});
