/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import PaginateMixin from '../../../mixins/paginate';
import { module, test } from 'qunit';

module('Unit | Mixin | paginate');

// Replace this with your real tests.
test('it works', function(assert) {
  const PaginateObject = Ember.Object.extend(PaginateMixin);
  const subject = PaginateObject.create();
  return assert.ok(subject);
});
