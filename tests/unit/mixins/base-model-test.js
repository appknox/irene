import { getOwner } from '@ember/application';
import DS from 'ember-data';
import BaseModelMixin from 'irene/mixins/base-model';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Mixin | base model', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.subject = function() {
      const BaseModelObject = DS.Model.extend(BaseModelMixin);
      this.owner.register('model:base-model-object', BaseModelObject);
      return run(() => {
        let store = getOwner(this).lookup('service:store');
        return store.createRecord('base-model-object', {});
      });
    };
  });

  test('the mixin does what it should', function(assert) {
    const mixin = this.subject();

    run(() => {
      const d = new Date("25 March 2015");
      assert.notOk(mixin.get('createdOnHumanized'));
      assert.notOk(mixin.get('createdOnDateTime'));
      mixin.set("createdOn", d);
      assert.equal(mixin.get('createdOnHumanized'), d.toLocaleDateString(), "Created On Humanized");
      assert.equal(mixin.get('createdOnDateTime'), `${d.toDateString()}, ${d.toLocaleTimeString()}`, "Created On Date Time");
    });
  });
});
