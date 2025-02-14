/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | device preference', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it exists', function (assert) {
    const devicePreference = this.owner
      .lookup('service:store')
      .createRecord('device-preference');

    devicePreference.set('platformVersion', '1');

    assert.equal(devicePreference.get('versionText'), '1', 'Version Text');

    devicePreference.set('platformVersion', '0');

    assert.equal(
      devicePreference.get('versionText'),
      'Any Version',
      'Version Text'
    );
  });
});
