import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | manualscan', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(10);

    const manualscan = run(() =>
      this.owner.lookup('service:store').createRecord('manualscan')
    );

    run(function () {
      assert.strictEqual(manualscan.get('filteredAppEnv'), 0, 'App Env/0');
      manualscan.set('appEnv', 1);
      assert.strictEqual(manualscan.get('filteredAppEnv'), 1, 'App Env/1');

      assert.strictEqual(
        manualscan.get('filteredAppAction'),
        0,
        'App Action/0'
      );

      manualscan.set('appAction', 1);

      assert.strictEqual(
        manualscan.get('filteredAppAction'),
        1,
        'App Action/1'
      );

      assert.false(manualscan.get('showProceedText'), 'Proceed Text/False');

      manualscan.set('appAction', 2);

      assert.true(manualscan.get('showProceedText'), 'Proceed Text/True');

      assert.strictEqual(
        manualscan.get('loginStatus'),
        'no',
        'Login Status/No'
      );

      manualscan.set('loginRequired', true);

      assert.strictEqual(
        manualscan.get('loginStatus'),
        'yes',
        'Login Status/Yes'
      );

      assert.strictEqual(manualscan.get('vpnStatus'), 'no', 'VPN Status/No');

      manualscan.set('vpnRequired', true);

      assert.strictEqual(manualscan.get('vpnStatus'), 'yes', 'VPN Status/Yes');
    });
  });
});
