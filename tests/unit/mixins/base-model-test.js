import Ember from 'ember';
import BaseModelMixin from 'irene/mixins/base-model';
import { module, test } from 'qunit';

module('Unit | Mixin | base model');

test('it works', function(assert) {
  const BaseModelObject = Ember.Object.extend(BaseModelMixin);
  const subject = BaseModelObject.create();
  assert.ok(subject);
});
