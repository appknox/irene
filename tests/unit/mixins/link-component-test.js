import EmberObject from '@ember/object'
import LinkComponentMixin from 'irene/mixins/link-component';
import { module, test } from 'qunit';

module('Unit | Mixin | link component');

// Replace this with your real tests.
test('it works', function(assert) {
  let LinkComponentObject = EmberObject.extend(LinkComponentMixin);
  let subject = LinkComponentObject.create();
  assert.ok(subject);
});
