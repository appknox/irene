import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | modal card', function(hooks) {
  setupTest(hooks);

  test('tapping button fires an external action', function(assert) {

    var component = this.owner.factoryFor('component:modal-card').create();
    run(function() {
      component.send('clearModal');
      assert.equal(component.get('isActive'),false, "Active/False");
    });
  });
});
