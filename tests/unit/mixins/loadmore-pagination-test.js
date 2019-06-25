import EmberObject from '@ember/object';
import LoadmorePaginationMixin from 'irene/mixins/loadmore-pagination';
import { module, test } from 'qunit';

module('Unit | Mixin | loadmore pagination');

// Replace this with your real tests.
test('it works', function(assert) {
  let LoadmorePaginationObject = EmberObject.extend(LoadmorePaginationMixin);
  let subject = LoadmorePaginationObject.create();
  assert.ok(subject);
});
