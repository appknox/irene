import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | confirm box', function(hooks) {
  setupTest(hooks);

  test('tapping button fires an external action', function(assert) {
    assert.expect(1);

    var component = this.owner.factoryFor('component:confirm-box').create();

    run(function() {
      component.send('clearModal');
      assert.equal(component.get('isActive'),false, "Clear Modal");
    });
  });
});
