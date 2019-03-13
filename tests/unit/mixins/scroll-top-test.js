import { getOwner } from '@ember/application';
import DS from 'ember-data';
import ScrollTopMixin from 'irene/mixins/scroll-top';
import { moduleFor, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleFor('mixin:scroll-top', 'Unit | Mixin | scroll top', {
  subject() {
    const ScrollTopObject = DS.Model.extend(ScrollTopMixin);
    this.register('model:scroll-top-object', ScrollTopObject);
    return run(() => {
      let store = getOwner(this).lookup('service:store');
      return store.createRecord('scroll-top-object', {});
    });
  }
});

test('the mixin does what it should', function(assert) {
  const mixin = this.subject();

  run(() => {
    assert.notOk(mixin.activate());
  });
});
