import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | sbom component', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component', {});
    assert.ok(model);
  });

  test('hasReachabilitySummary is true only for scannable verdicts', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component', {});

    model.reachability = {
      verdict: 'CONFIRMED_REACHABLE',
      path_found_count: 1,
      advisory_count: 2,
      unknown_count: 0,
    };

    assert.true(model.hasReachabilitySummary);

    model.reachability = {
      verdict: 'UNKNOWN',
      path_found_count: 0,
      advisory_count: 2,
      unknown_count: 2,
    };

    assert.false(model.hasReachabilitySummary);

    model.reachability = null;
    assert.false(model.hasReachabilitySummary);
  });
});
