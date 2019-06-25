import EmberObject from '@ember/object';
import RouterMixin from 'irene/mixins/router';
import { module, test } from 'qunit';

module('Unit | Mixin | router');

// Replace this with your real tests.
test('it works', function(assert) {
  let RouterObject = EmberObject.extend(RouterMixin);
  let subject = RouterObject.create();
  assert.ok(subject);
});
