import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | manualscan', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const manualscan = run(() => this.owner.lookup('service:store').createRecord('manualscan'));
    run(function() {
      assert.equal(manualscan.get('filteredAppEnv'), 0, "App Env/0");
      manualscan.set('appEnv', 1);
      assert.equal(manualscan.get('filteredAppEnv'), 1, "App Env/1");

      assert.equal(manualscan.get('filteredAppAction'), 0, "App Action/0");
      manualscan.set('appAction', 1);
      assert.equal(manualscan.get('filteredAppAction'), 1, "App Action/1");

      assert.equal(manualscan.get('showProceedText'), false, "Proceed Text/False");
      manualscan.set('appAction', "proceed");
      assert.equal(manualscan.get('showProceedText'), true, "Proceed Text/True");

      assert.equal(manualscan.get('loginStatus'), "no", "Login Status/No");
      manualscan.set('loginRequired', true);
      assert.equal(manualscan.get('loginStatus'), "yes", "Login Status/Yes");

      assert.equal(manualscan.get('vpnStatus'), "no", "VPN Status/No");
      manualscan.set('vpnRequired', true);
      assert.equal(manualscan.get('vpnStatus'), "yes", "VPN Status/Yes");
    });
  });
});
