import Ember from 'ember';
import PaginateMixin from '../../../mixins/paginate';
import { module, test } from 'qunit';

module('Unit | Mixin | paginate');

test('it works', function(assert) {
  const PaginateObject = Ember.Object.extend(PaginateMixin);
  const subject = PaginateObject.create();
  assert.ok(subject);
});
