/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal, qunit/no-assert-equal-boolean */
import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';
import ENUMS from 'irene/enums';
import { module, test } from 'qunit';

module('Unit | Model | analysis', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it exists', function (assert) {
    const analysis = run(() =>
      this.owner.lookup('service:store').createRecord('analysis')
    );
    let store = this.owner.lookup('service:store');
    run(function () {
      assert.equal(analysis.isScanning, 0, 'Unknown');

      assert.equal(analysis.hasType(), false, 'No type');

      const vulnerability = store.createRecord('vulnerability');
      vulnerability.set('types', [1, 2, 3]);
      analysis.set('vulnerability', vulnerability);

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
      assert.equal(analysis.isRisky, true, 'Is Risky');
      assert.equal(
        analysis.riskLabelClass,
        'tag is-critical',
        'Risk Label Class'
      );

      analysis.set('overriddenRisk', ENUMS.RISK.CRITICAL);
      assert.equal(
        analysis.overriddenRiskIconClass,
        'fa-warning',
        'Overridden Risk Icon Class'
      );
      assert.equal(
        analysis.overriddenRiskLabelClass,
        cls + ' ' + 'is-critical',
        'Overridden Risk Icon Class'
      );
    });
  });
});
