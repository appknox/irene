/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import ScrollTopMixin from '../../../mixins/scroll-top';
import { module, test } from 'qunit';

module('Unit | Mixin | scroll top');

// Replace this with your real tests.
test('it works', function(assert) {
  const ScrollTopObject = Ember.Object.extend(ScrollTopMixin);
  const subject = ScrollTopObject.create();
  return assert.ok(subject);
});
