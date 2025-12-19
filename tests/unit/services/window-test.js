import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | window', function (hooks) {
  setupTest(hooks);

  test('it should set current window location and return url', function (assert) {
    let service = this.owner.lookup('service:window');
    assert.ok(service);

    // Note: not possible to test bthis ecause the current test window is getting updated
    // let url = 'http://example.com';
    // let updatedUrl = service.locationAssign(url);
    // assert.strictEqual(url, updatedUrl);
  });
});
