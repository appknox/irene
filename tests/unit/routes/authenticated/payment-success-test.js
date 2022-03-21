/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

module('Unit | Route | authenticated/payment success', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // start Mirage
    this.server = startMirage();
  });

  hooks.afterEach(function() {
    // shutdown Mirage
    this.server.shutdown();
  });

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:authenticated/payment-success');
    assert.notOk(route.beforeModel());
  });
});
