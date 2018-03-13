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
    assert.notOk(mixin.get('createdOnHumanized'));
    assert.notOk(mixin.get('createdOnDateTime'));
    mixin.set("createdOn", new Date("25 March 2015"));
    assert.equal(mixin.get('createdOnHumanized'), "March 25, 2015", "Created On Humanized");
    assert.equal(mixin.get('createdOnDateTime'), "Wed Mar 25 2015, 00:00:00", "Created On Date Time");
  });
});
