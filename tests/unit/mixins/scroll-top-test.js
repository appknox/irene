import Ember from 'ember';
import DS from 'ember-data';
import ScrollTopMixin from 'irene/mixins/scroll-top';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:scroll-top', 'Unit | Mixin | scroll top', {
  subject() {
    const ScrollTopObject = DS.Model.extend(ScrollTopMixin);
    this.register('model:scroll-top-object', ScrollTopObject);
    return Ember.run(() => {
      let store = Ember.getOwner(this).lookup('service:store');
      return store.createRecord('scroll-top-object', {});
    });
  }
});

test('the mixin does what it should', function(assert) {
  const mixin = this.subject();

  Ember.run(() => {
    assert.notOk(mixin.activate());
  });
});
