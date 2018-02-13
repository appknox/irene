/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('plan', 'Unit | Model | plan', {
  // Specify the other units that are required for this test.
  needs: ['model:invoice']
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
