/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal, qunit/no-assert-equal-boolean */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | file', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it passes', function (assert) {
    const file = this.owner.lookup('service:store').createRecord('file', {
      id: '1',
    });

    assert.equal(file.get('isManualRequested'), true, 'Manual Requested');

    assert.equal(file.get('isRunningApiScan'), false, 'API Scan');

    file.set('apiScanProgress', 100);

    assert.equal(file.get('isRunningApiScan'), false, 'API Scan not done');

    assert.equal(file.scanProgressClass(), false, 'Scan Progress Class');

    assert.equal(file.scanProgressClass(true), true, 'Scan Progress Class');

    assert.equal(file.get('isStaticCompleted'), false, 'Static Scan');
  });
});
