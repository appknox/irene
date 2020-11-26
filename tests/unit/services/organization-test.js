import {
  module,
  test
} from 'qunit';
import {
  setupTest
} from 'ember-qunit';

module('Unit | Service | organization', function (hooks) {
  setupTest(hooks);

  console.log('check')

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:organization');
    assert.ok(service);
  });

  test('Load organization', async function (assert) {
    console.log('this', this)
    this.load();
  });
});
