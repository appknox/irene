/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('invitation', 'Unit | Model | invitation', {
  // Specify the other units that are required for this test.
  needs: ['model:team', 'model:user']
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
