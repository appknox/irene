import Ember from 'ember';
import ScrollTopMixin from '../../../mixins/scroll-top';
import { module, test } from 'qunit';

module('Unit | Mixin | scroll top');

test('it works', function(assert) {
  const ScrollTopObject = Ember.Object.extend(ScrollTopMixin);
  const subject = ScrollTopObject.create();
  assert.ok(subject);
});
