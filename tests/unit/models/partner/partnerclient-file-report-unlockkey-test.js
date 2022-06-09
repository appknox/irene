import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Model | partner/partnerclient file report unlockkey',
  function (hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let model = store.createRecord(
        'partner/partnerclient-file-report-unlockkey',
        {}
      );
      assert.ok(model);
    });
  }
);
