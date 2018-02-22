import { moduleForModel, test } from 'ember-qunit';

moduleForModel('manualscan', 'Unit | Model | manualscan', {
  needs: []
});

test('it exists', function(assert) {
  const manualscan = this.subject();
  assert.equal(manualscan.get('filteredAppEnv'), 0, "App Env");
  assert.equal(manualscan.get('filteredAppAction'), 0, "App Action");
  assert.equal(manualscan.get('showProceedText'), false, "Proceed Text");
  assert.equal(manualscan.get('loginStatus'), "no", "Login Status");
  assert.equal(manualscan.get('vpnStatus'), "no", "VPN Status");
});
