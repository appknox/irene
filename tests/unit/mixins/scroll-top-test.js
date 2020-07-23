import { getOwner } from '@ember/application';
import DS from 'ember-data';
import ScrollTopMixin from 'irene/mixins/scroll-top';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Mixin | scroll top', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.subject = function() {
      const ScrollTopObject = DS.Model.extend(ScrollTopMixin);
      this.owner.register('model:scroll-top-object', ScrollTopObject);
      return run(() => {
        let store = getOwner(this).lookup('service:store');
        return store.createRecord('scroll-top-object', {});
      });
    };
  });

  test('the mixin does what it should', function(assert) {
    const mixin = this.subject();

    run(() => {
      assert.notOk(mixin.activate());
    });
  });
});
