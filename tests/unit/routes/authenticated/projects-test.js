import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  setupMirage
} from "ember-cli-mirage/test-support";

module('Unit | Route | authenticated/projects', function (hooks) {
  // setupTest(hooks);

  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/projects');
    assert.ok(route);
  });
});
