import Ember from 'ember';
import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:base-model', 'Unit | Mixin | base model', {
  needs: [
    'model:user'
  ],

  subject() {
    const BaseModelObject = DS.Model.extend(BaseModelMixin);
    this.register('model:base-model-object', BaseModelObject);
    return Ember.run(() => {
      let store = Ember.getOwner(this).lookup('service:store');
      return store.createRecord('base-model-object', {});
    });
  }
});

test('the mixin does what it should', function(assert) {
  const mixin = this.subject();

  Ember.run(() => {
    const d = new Date("25 March 2015");
    assert.notOk(mixin.get('createdOnHumanized'));
    assert.notOk(mixin.get('createdOnDateTime'));
    mixin.set("createdOn", d);
    assert.equal(mixin.get('createdOnHumanized'), d.toLocaleDateString(), "Created On Humanized");
    assert.equal(mixin.get('createdOnDateTime'), `${d.toDateString()}, ${d.toLocaleTimeString()}`, "Created On Date Time");
  });
});
